import * as JsonSchemaToTs from "./JsonSchemaToTs";
import type * as Types from "./types";
import * as TsGenerator from "./TsGenerator";
import * as FileSystem from "./FileSystem";

export { Types, JsonSchemaToTs };

export const generateFromJsonSchema = (jsonSchema: Types.JSONSchema): string => {
  const createFunction: TsGenerator.CreateFunction = () => {
    return JsonSchemaToTs.generate(process.cwd(), process.cwd(), jsonSchema, true);
  };
  return TsGenerator.generate(createFunction);
};

export const generateFromFile = (entryPoint: string): string => {
  const jsonSchema = FileSystem.fileSystem.loadJsonOrYaml(entryPoint);
  const createFunction: TsGenerator.CreateFunction = () => {
    return JsonSchemaToTs.generate(entryPoint, entryPoint, jsonSchema, false);
  };
  return TsGenerator.generate(createFunction);
};
