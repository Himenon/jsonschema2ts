import * as Types from "../types";

export const isReference = (data: any): data is Types.Reference => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return typeof data.$ref === "string";
};

export const isUnSupportSchema = (schema: Types.JSONSchema): schema is Types.UnSupportSchema => {
  return Array.isArray(schema.type);
};

export const isObjectSchema = (schema: Types.JSONSchema): schema is Types.ObjectSchema => {
  return schema.type === "object";
};

export const isArraySchema = (schema: Types.JSONSchema): schema is Types.ArraySchema => {
  return schema.type === "array";
};

export const isPrimitiveSchema = (schema: Types.JSONSchema): schema is Types.PrimitiveSchema => {
  if (typeof schema.type !== "string") {
    return false;
  }
  if (schema.type === "object") {
    return false;
  }
  if (schema.type === "array") {
    return false;
  }
  return true;
};

export const isNumberArray = (list: any[]): list is number[] => {
  return !list.some(item => typeof item !== "number");
};

export const isStringArray = (list: any[]): list is string[] => {
  return !list.some(item => typeof item !== "string");
};

export const isObjectSchemaWithAdditionalProperties = (schema: Types.ObjectSchema): schema is Types.ObjectSchemaWithAdditionalProperties => {
  return !!schema.additionalProperties;
};

export const isOneOfSchema = (schema: Types.JSONSchema): schema is Types.OneOfSchema => {
  return !!schema.oneOf && typeof schema.oneOf !== "boolean" && Array.isArray(schema.oneOf);
};

export const isAllOfSchema = (schema: Types.JSONSchema): schema is Types.AllOfSchema => {
  return !!schema.allOf && typeof schema.allOf !== "boolean" && Array.isArray(schema.allOf);
};

export const isAnyOfSchema = (schema: Types.JSONSchema): schema is Types.AnyOfSchema => {
  return !!schema.anyOf && typeof schema.anyOf !== "boolean" && Array.isArray(schema.anyOf);
};
