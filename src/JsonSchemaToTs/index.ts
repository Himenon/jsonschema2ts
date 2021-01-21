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
    const { maybeResolvedName } = context.resolveReferencePath(currentPoint, reference.path);
    if (reference.type === "local") {
      store.addStatement(targetPoint, {
        kind: "typeAlias",
        name: name,
        value: factory.TypeAliasDeclaration.create({
          export: true,
          name: name,
          type: factory.TypeReferenceNode.create({
            name: maybeResolvedName,
          }),
        }),
      });
    } else {
      Schema.addSchema(entryPoint, reference.referencePoint, store, reference.path, reference.name, reference.data, context);
      if (store.hasStatement(targetPoint, ["interface", "typeAlias"])) {
        return;
      }
      store.addStatement(targetPoint, {
        kind: "typeAlias",
        name,
        value: factory.TypeAliasDeclaration.create({
          export: true,
          name: name,
          comment: reference.data.description,
          type: factory.TypeReferenceNode.create({
            name: maybeResolvedName,
          }),
        }),
      });
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
