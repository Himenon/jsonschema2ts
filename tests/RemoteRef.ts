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
