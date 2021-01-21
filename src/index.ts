import * as JsonSchema2TypeDeclaration from "./JsonSchema2TypeDeclaration";
import type * as Types from "./types";
import * as TsGenerator from "./TsGenerator";

export { Types, JsonSchema2TypeDeclaration };

export const generateFromJsonSchema = (jsonSchema: Types.JSONSchema): string => {
  const createFunction: TsGenerator.CreateFunction = () => {
    return JsonSchema2TypeDeclaration.generate(jsonSchema);
  };
  return TsGenerator.generate(createFunction);
};
