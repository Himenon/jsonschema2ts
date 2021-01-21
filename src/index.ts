import * as JsonSchemaToTs from "./JsonSchemaToTs";
import type * as Types from "./types";
import * as TsGenerator from "./TsGenerator";

export { Types, JsonSchemaToTs };

export const generateFromJsonSchema = (jsonSchema: Types.JSONSchema): string => {
  const createFunction: TsGenerator.CreateFunction = () => {
    return JsonSchemaToTs.generate("", "", jsonSchema);
  };
  return TsGenerator.generate(createFunction);
};
