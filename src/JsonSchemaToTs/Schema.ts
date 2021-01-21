import ts from "typescript";

import * as Factory from "../Factory";
import * as Guard from "./Guard";
import * as ToTypeNode from "./TypeNode";
import * as Types from "../types";
import { ArraySchema, ObjectSchema, PrimitiveSchema } from "../types";
import * as Store from "./Store";

const factory = Factory.create();

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  schema: ObjectSchema,
  context: ToTypeNode.Context,
): ts.PropertySignature[] => {
  if (!schema.properties) {
    return [];
  }
  const required: string[] = schema.required || [];
  return Object.entries(schema.properties).map(([propertyName, property]) => {
    return factory.PropertySignature.create({
      name: propertyName,
      optional: !required.includes(propertyName),
      type: ToTypeNode.convert(entryPoint, currentPoint, property, context),
      comment: typeof property !== "boolean" ? property.description : undefined,
    });
  });
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  name: string,
  schema: ObjectSchema,
  context: ToTypeNode.Context,
): ts.InterfaceDeclaration => {
  if (schema.type !== "object") {
    throw new Error("Please use generateTypeAlias");
  }
  let members: ts.TypeElement[] = [];
  const propertySignatures = generatePropertySignatures(entryPoint, currentPoint, schema, context);
  if (Guard.isObjectSchemaWithAdditionalProperties(schema)) {
    const additionalProperties = ToTypeNode.convertAdditionalProperties(entryPoint, currentPoint, schema, context);
    if (schema.additionalProperties === true) {
      members = members.concat(additionalProperties);
    } else {
      members = [...propertySignatures, additionalProperties];
    }
  } else {
    members = propertySignatures;
  }
  return factory.InterfaceDeclaration.create({
    export: true,
    name,
    members,
    comment: schema.description,
  });
};

export const generateArrayTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  name: string,
  schema: ArraySchema,
  context: ToTypeNode.Context,
): ts.TypeAliasDeclaration => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name,
    comment: schema.description,
    type: ToTypeNode.convert(entryPoint, currentPoint, schema, context),
  });
};

export const generateTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  name: string,
  schema: PrimitiveSchema,
): ts.TypeAliasDeclaration => {
  let type: ts.TypeNode;
  if (schema.enum) {
    if (Guard.isNumberArray(schema.enum) && (schema.type === "number" || schema.type === "integer")) {
      type = factory.TypeNode.create({
        type: schema.type,
        enum: schema.enum,
      });
    } else if (Guard.isStringArray(schema.enum) && schema.type === "string") {
      type = factory.TypeNode.create({
        type: schema.type,
        enum: schema.enum,
      });
    } else {
      type = factory.TypeNode.create({
        type: schema.type,
      });
    }
  } else {
    type = factory.TypeNode.create({
      type: schema.type,
    });
  }
  return factory.TypeAliasDeclaration.create({
    export: true,
    name,
    type,
    comment: schema.description,
  });
};

export const generateMultiTypeAlias = (
  entryPoint: string,
  currentPoint: string,
  name: string,
  schemas: Types.JSONSchema[],
  context: ToTypeNode.Context,
  multiType: "oneOf" | "allOf" | "anyOf",
): ts.TypeAliasDeclaration => {
  const type = ToTypeNode.generateMultiTypeNode(entryPoint, currentPoint, schemas, context, ToTypeNode.convert, multiType);
  return factory.TypeAliasDeclaration.create({
    export: true,
    name,
    type,
  });
};

export const addSchema = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  targetPoint: string,
  declarationName: string,
  schema: Types.JSONSchema | undefined,
  context: ToTypeNode.Context,
): void => {
  if (!schema) {
    return;
  }
  if (Guard.isAllOfSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: declarationName,
      value: generateMultiTypeAlias(entryPoint, currentPoint, declarationName, schema.allOf, context, "allOf"),
    });
  } else if (Guard.isOneOfSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: declarationName,
      value: generateMultiTypeAlias(entryPoint, currentPoint, declarationName, schema.oneOf, context, "oneOf"),
    });
  } else if (Guard.isAnyOfSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: declarationName,
      value: generateMultiTypeAlias(entryPoint, currentPoint, declarationName, schema.anyOf, context, "allOf"),
    });
  } else if (Guard.isArraySchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: declarationName,
      value: generateArrayTypeAlias(entryPoint, currentPoint, declarationName, schema, context),
    });
  } else if (Guard.isObjectSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "interface",
      name: declarationName,
      value: generateInterface(entryPoint, currentPoint, declarationName, schema, context),
    });
  } else if (Guard.isPrimitiveSchema(schema)) {
    store.addStatement(targetPoint, {
      kind: "typeAlias",
      name: declarationName,
      value: generateTypeAlias(entryPoint, currentPoint, store, declarationName, schema),
    });
  }
};
