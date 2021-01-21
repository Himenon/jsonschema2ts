import ts from "typescript";
import type { Context } from "./types";

export interface Params {
  typeNodes: ts.TypeNode[];
}

export interface Factory {
  create: (params: Params) => ts.IntersectionTypeNode;
}

export const create = ({ factory }: Context): Factory["create"] => (params: Params): ts.IntersectionTypeNode => {
  const node = factory.createIntersectionTypeNode(params.typeNodes);
  return node;
};

export const make = (context: Context): Factory => {
  return {
    create: create(context),
  };
};
