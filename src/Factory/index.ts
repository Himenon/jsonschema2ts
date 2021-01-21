import ts from "typescript";

import * as PropertySignature from "./PropertySignature";
import * as TypeNode from "./TypeNode";
import * as UnionTypeNode from "./UnionTypeNode";
import * as LiteralTypeNode from "./LiteralTypeNode";
import * as IntersectionTypeNode from "./IntersectionTypeNode";
import * as TypeReferenceNode from "./TypeReferenceNode";
import * as IndexSignatureDeclaration from ".IndexSignatureDeclaration";

import type { Context } from "./types";

export interface Type {
  PropertySignature: PropertySignature.Factory;
  TypeNode: TypeNode.Factory;
  UnionTypeNode: UnionTypeNode.Factory;
  LiteralTypeNode: LiteralTypeNode.Factory;
  IntersectionTypeNode: IntersectionTypeNode.Factory;
  TypeReferenceNode: TypeReferenceNode.Factory;
  IndexSignatureDeclaration: IndexSignatureDeclaration.Factory;
}

export const create = (): Type => {
  const context: Context = { factory: ts.factory };
  return {
    PropertySignature: PropertySignature.make(context),
    TypeNode: TypeNode.make(context),
    UnionTypeNode: UnionTypeNode.make(context),
    LiteralTypeNode: LiteralTypeNode.make(context),
    IntersectionTypeNode: IntersectionTypeNode.make(context),
    TypeReferenceNode: TypeReferenceNode.make(context),
    IndexSignatureDeclaration: IndexSignatureDeclaration.make(context),
  };
};
