import ts from "typescript";
import * as Types from "../types";
import * as Schema from "./Schema";
import * as Store from "./Store";
import * as Context from "./Context";
import * as Guard from "./Guard";
import * as Reference from "./Reference";
import * as Factory from "../Factory";
import type * as TypeNode from "./TypeNode";

const factory = Factory.create();

const TARGET_SCHEMAS = ["properties", "definitions"];

const appendSchema = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  context: TypeNode.Context,
  name: string,
  schema: Types.JSONSchema,
): void => {
  const targetPoint = name;
  if (Guard.isReference(schema)) {
    const reference = Reference.generate<Types.JSONSchema>(entryPoint, currentPoint, schema, context.isOnlyLocalReference);
    if (reference.type === "local") {
      const { unresolvedPaths } = context.resolveReferencePath(currentPoint, reference.path);
      const resolveName = (TARGET_SCHEMAS.includes(unresolvedPaths[0])
        ? unresolvedPaths.slice(1, unresolvedPaths.length)
        : unresolvedPaths
      ).join(".");
      store.addStatement(targetPoint, {
        kind: "typeAlias",
        name: name,
        value: factory.TypeAliasDeclaration.create({
          export: true,
          name: name,
          type: factory.TypeReferenceNode.create({
            name: resolveName,
          }),
        }),
      });
    } else {
      reference.data.$ref;
    }
  } else {
    Schema.addSchema(entryPoint, currentPoint, store, targetPoint, name, schema, context);
  }
};

export const generate = (
  entryPoint: string,
  currentPoint: string,
  jsonSchema: Types.JSONSchema,
  isOnlyLocalReference: boolean,
): ts.Statement[] => {
  const store = Store.create(jsonSchema);
  const context = Context.create(entryPoint, store, isOnlyLocalReference);
  Object.entries(jsonSchema.definitions || {}).forEach(([name, schema]) => {
    if (typeof schema === "boolean") {
      return;
    }
    appendSchema(entryPoint, currentPoint, store, context, name, schema);
  });
  Object.entries(jsonSchema.properties || {}).forEach(([name, schema]) => {
    if (typeof schema === "boolean") {
      return;
    }
    appendSchema(entryPoint, currentPoint, store, context, name, schema);
  });
  return store.getRootStatements();
};
