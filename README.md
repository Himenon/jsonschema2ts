# @himenon/jsonschema2ts

Output TypeScript type definition from jsonschema.

## Usage

### `generateFromJsonSchema`

```ts
import { generateFromJsonSchema } from "@himenon/jsonschema2ts";

const jsonSchema = {}; // your json schema
const code = generateFromJsonSchema(jsonSchema); // or yaml
```

### `generateFromFile`

```ts
import { generateFromJsonSchema } from "@himenon/jsonschema2ts";

const code = generateFromJsonSchema("your/file/path.json"); // or yaml
```

## Example

### Only local reference

[JSON Input](./test/schema/only-local-ref-root.json)

**Output**

```ts
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
```

### Use Remote reference

[JSON Input](./test/schema/remote-ref-root.json)

```ts
export interface Book {
  title?: string;
}
export type Books = Book[];
export namespace Params {
  export type B = string;
  export interface A {
    B?: B;
  }
}
export type A = Params.A;
```

## LICENCE

[@himenon-node-lib-template](https://github.com/Himenon/jsonschema2ts)・MIT
