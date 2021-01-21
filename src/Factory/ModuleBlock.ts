import ts from "typescript";
import type { Context } from "./types";

export interface UpdateParams {
  node: ts.ModuleBlock;
  statements: ts.Statement[];
}

export interface Factory {
  update: (params: UpdateParams) => ts.ModuleBlock;
}

export const update = ({ factory }: Context): Factory["update"] => (params: UpdateParams): ts.ModuleBlock => {
  const { node, statements } = params;
  return factory.updateModuleBlock(node, statements);
};

export const make = (context: Context): Factory => {
  return {
    update: update(context),
  };
};
