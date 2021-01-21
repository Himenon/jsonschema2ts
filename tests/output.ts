export type LocalReferenceString = string;
export type StringType = string;
export type StringHasEnumType = "a" | "A" | "b" | "B" | "あ" | "ア" | "い" | "イ" | "漢" | "字";
export type NumberType = number;
export type BooleanType = boolean;
export type ArrayType = string[];
export type OneOfType = string | number | boolean;
export type AllOfType = string & number & boolean;
export interface ObjectType {
  stringType: string;
  numberType?: number;
  booleanType: boolean;
  arrayType?: string[];
}
export type RefToDefinitionString = LocalReferenceString;
export type RefToPropertyString = StringType;
