import ts from "typescript";
import * as Types from "../types";
import * as Schema from "./Schema";
import * as Store from "./Store";
import * as Context from "./Context";

export const generate = (entryPoint: string, currentPoint: string, jsonSchema: Types.JSONSchema): ts.Statement[] => {
  const store = Store.create(jsonSchema);
  const context = Context.create(entryPoint, store);
  Object.entries(jsonSchema.properties || {}).forEach(([name, schema]) => {
    if (typeof schema === "boolean") {
      return;
    }
    console.log({ name, schema });
    Schema.addSchema(entryPoint, currentPoint, store, name, name, schema, context);
  });
  return store.getRootStatements();
};
