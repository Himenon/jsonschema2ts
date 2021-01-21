import ts from "typescript";

import * as Reference from "../Reference";
import * as Guard from "../Guard";
import type * as Types from "../types";
import { ObjectSchemaWithAdditionalProperties } from "../types";
import * as Factory from "../Factory";

const factory = Factory.create();

export interface ResolveReferencePath {
  name: string;
  maybeResolvedName: string;
  unresolvedPaths: string[];
}

export interface Context {
  setReferenceHandler: (currentPoint: string, reference: Reference.Type<Types.JSONSchema | Types.JSONSchemaDefinition>) => void;
  resolveReferencePath: (currentPoint: string, referencePath: string) => ResolveReferencePath;
}

export type Convert = (
  entryPoint: string,
  currentPoint: string,

  schema: Types.JSONSchema | Types.Reference | Types.JSONSchemaDefinition,
  setReference: Context,
) => ts.TypeNode;

export const generateMultiTypeNode = (
  entryPoint: string,
  currentPoint: string,
  schemas: Types.JSONSchema[],
  setReference: Context,
  convert: Convert,
  multiType: "oneOf" | "allOf" | "anyOf",
): ts.TypeNode => {
  const typeNodes = schemas.map(schema => convert(entryPoint, currentPoint, schema, setReference));
  if (multiType === "oneOf") {
    return factory.UnionTypeNode.create({
      typeNodes,
    });
  }
  if (multiType === "allOf") {
    return factory.IntersectionTypeNode.create({
      typeNodes,
    });
  }
  // TODO Feature Development: Calculate intersection types
  return factory.TypeNode.create({ type: "never" });
};

const nullable = (typeNode: ts.TypeNode, nullable: boolean): ts.TypeNode => {
  if (nullable) {
    return factory.UnionTypeNode.create({
      typeNodes: [
        typeNode,
        factory.TypeNode.create({
          type: "null",
        }),
      ],
    });
  }
  return typeNode;
};

export const convert: Convert = (
  entryPoint: string,
  currentPoint: string,
  schema: Types.JSONSchema | Types.Reference | Types.JSONSchemaDefinition,
  context: Context,
): ts.TypeNode => {
  if (typeof schema === "boolean") {
    // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
    return factory.TypeNode.create({
      type: "object",
      value: [],
    });
  }
  if (Guard.isReference(schema)) {
    const reference = Reference.generate<Types.JSONSchema | Types.JSONSchemaDefinition>(entryPoint, currentPoint, schema);
    if (reference.type === "local") {
      // Type Aliasを作成 (or すでにある場合は作成しない)
      context.setReferenceHandler(currentPoint, reference);
      return factory.TypeReferenceNode.create({ name: context.resolveReferencePath(currentPoint, reference.path).maybeResolvedName });
    }
    // Type AliasもしくはInterfaceを作成
    context.setReferenceHandler(currentPoint, reference);
    // Aliasを貼る
    return factory.TypeReferenceNode.create({ name: context.resolveReferencePath(currentPoint, reference.path).name });
  }

  if (Guard.isOneOfSchema(schema)) {
    return generateMultiTypeNode(entryPoint, currentPoint, schema.oneOf, context, convert, "oneOf");
  }
  if (Guard.isAllOfSchema(schema)) {
    return generateMultiTypeNode(entryPoint, currentPoint, schema.allOf, context, convert, "allOf");
  }
  if (Guard.isAnyOfSchema(schema)) {
    return generateMultiTypeNode(entryPoint, currentPoint, schema.anyOf, context, convert, "anyOf");
  }

  // schema.type
  if (!schema.type) {
    throw new Error("Please set 'type' or '$ref' property \n" + JSON.stringify(schema));
  }
  switch (schema.type) {
    case "boolean": {
      const typeNode = factory.TypeNode.create({
        type: "boolean",
      });
      return nullable(typeNode, !!schema.nullable);
    }
    case "null": {
      return factory.TypeNode.create({
        type: schema.type,
      });
    }
    case "integer":
    case "number": {
      const items = schema.enum;
      let typeNode: ts.TypeNode;
      if (items && Guard.isNumberArray(items)) {
        typeNode = factory.TypeNode.create({
          type: schema.type,
          enum: items,
        });
      } else {
        typeNode = factory.TypeNode.create({
          type: schema.type,
        });
      }
      return nullable(typeNode, !!schema.nullable);
    }
    case "string": {
      const items = schema.enum;
      let typeNode: ts.TypeNode;
      if (items && Guard.isStringArray(items)) {
        typeNode = factory.TypeNode.create({
          type: schema.type,
          enum: items,
        });
      } else {
        typeNode = factory.TypeNode.create({
          type: schema.type,
        });
      }
      return nullable(typeNode, !!schema.nullable);
    }
    case "array": {
      if (Array.isArray(schema.items) || typeof schema.items === "boolean") {
        throw new Error(`schema.items = ${JSON.stringify(schema.items)}`);
      }
      const typeNode = factory.TypeNode.create({
        type: schema.type,
        value: schema.items
          ? convert(entryPoint, currentPoint, schema.items, context)
          : factory.TypeNode.create({
              type: "undefined",
            }),
      });
      return nullable(typeNode, !!schema.nullable);
    }
    case "object": {
      const required: string[] = schema.required || [];
      // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
      if (schema.additionalProperties === true) {
        return factory.TypeNode.create({
          type: schema.type,
          value: [],
        });
      }
      const value: ts.PropertySignature[] = Object.entries(schema.properties || {}).map(([name, jsonSchema]) => {
        return factory.PropertySignature.create({
          name,
          type: convert(entryPoint, currentPoint, jsonSchema, context),
          optional: !required.includes(name),
          comment: typeof jsonSchema !== "boolean" ? jsonSchema.description : undefined,
        });
      });
      if (schema.additionalProperties) {
        const additionalProperties = factory.IndexSignatureDeclaration.create({
          name: "key",
          type: convert(entryPoint, currentPoint, schema.additionalProperties, context),
        });
        return factory.TypeNode.create({
          type: schema.type,
          value: [...value, additionalProperties],
        });
      }
      const typeNode = factory.TypeNode.create({
        type: schema.type,
        value,
      });
      return nullable(typeNode, !!schema.nullable);
    }
    default:
      throw new Error("what is this? \n" + JSON.stringify(schema, null, 2));
  }
};

export const convertAdditionalProperties = (
  entryPoint: string,
  currentPoint: string,

  schema: ObjectSchemaWithAdditionalProperties,
  setReference: Context,
): ts.IndexSignatureDeclaration => {
  // // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
  if (schema.additionalProperties === true) {
    factory.TypeNode.create({
      type: schema.type,
      value: [],
    });
  }
  const additionalProperties = factory.IndexSignatureDeclaration.create({
    name: "key",
    type: convert(entryPoint, currentPoint, schema.additionalProperties, setReference),
  });
  return additionalProperties;
};
