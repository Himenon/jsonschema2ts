import ts from "typescript";

import * as PropertySignature from "./PropertySignature";
import * as TypeNode from "./TypeNode";
import * as UnionTypeNode from "./UnionTypeNode";
import * as LiteralTypeNode from "./LiteralTypeNode";
import * as IntersectionTypeNode from "./IntersectionTypeNode";
import * as TypeReferenceNode from "./TypeReferenceNode";
import * as IndexSignatureDeclaration from "./IndexSignatureDeclaration";
import * as TypeAliasDeclaration from "./TypeAliasDeclaration";
import * as InterfaceDeclaration from "./InterfaceDeclaration";
import * as Namespace from "./Namespace";

import type { Context } from "./types";

export interface Type {
  PropertySignature: PropertySignature.Factory;
  TypeNode: TypeNode.Factory;
  UnionTypeNode: UnionTypeNode.Factory;
  LiteralTypeNode: LiteralTypeNode.Factory;
  IntersectionTypeNode: IntersectionTypeNode.Factory;
  TypeReferenceNode: TypeReferenceNode.Factory;
  IndexSignatureDeclaration: IndexSignatureDeclaration.Factory;
  TypeAliasDeclaration: TypeAliasDeclaration.Factory;
  InterfaceDeclaration: InterfaceDeclaration.Factory;
  Namespace: Namespace.Factory;
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
    TypeAliasDeclaration: TypeAliasDeclaration.make(context),
    InterfaceDeclaration: InterfaceDeclaration.make(context),
    Namespace: Namespace.make(context),
  };
};
