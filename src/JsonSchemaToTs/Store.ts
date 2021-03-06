import * as fs from "fs";

import { Tree } from "@himenon/path-oriented-data-structure";
import Dot from "dot-prop";
import ts from "typescript";

import * as Factory from "../Factory";
import * as Types from "../types";
import * as Structure from "./structure";

const factory = Factory.create();

export interface Type {
  addStatement: (path: string, statement: Structure.ComponentParams) => void;
  getStatement: <T extends Structure.DataStructure.Kind>(path: string, kind: T) => Structure.DataStructure.GetChild<T> | undefined;
  hasStatement: (path: string, types: Structure.DataStructure.Kind[]) => boolean;
  addAdditionalStatement: (statements: ts.Statement[]) => void;
  getRootStatements: () => ts.Statement[];
  isAfterDefined: (referencePath: string) => boolean;
}

interface State {
  additionalStatements: ts.Statement[];
}

export const create = (rootJsonSchema: Types.JSONSchema): Type => {
  const { operator, getChildByPaths } = Structure.create();
  const state: State = {
    additionalStatements: [],
  };
  const isAfterDefined = (referencePath: string) => {
    return !!Dot.get(rootJsonSchema, referencePath.replace(/\//g, "."));
  };

  const convertNamespace = (tree: Tree<Structure.NamespaceTree.Kind> | Structure.NamespaceTree.Item): ts.Statement => {
    const statements: ts.Statement[] = [];
    Object.values(tree.getChildren()).map(child => {
      if (child instanceof Tree || child instanceof Structure.NamespaceTree.Item) {
        statements.push(convertNamespace(child));
      } else if (child instanceof Structure.InterfaceNode.Item) {
        statements.push(child.value);
      } else if (child instanceof Structure.TypeAliasNode.Item) {
        statements.push(child.value);
      }
    });
    if (tree instanceof Structure.NamespaceTree.Item) {
      return factory.Namespace.create({
        export: true,
        name: tree.params.name,
        statements,
        comment: tree.params.comment,
        deprecated: tree.params.deprecated,
      });
    }
    return factory.Namespace.create({
      export: true,
      name: tree.name,
      statements,
    });
  };

  const getRootStatements = (): ts.Statement[] => {
    const rootChildren = Object.values(operator.getHierarchy().children || {});
    const statements = rootChildren.reduce<ts.Statement[]>((statements, child) => {
      const result1 = getChildByPaths(child.name, "namespace");
      if (result1) {
        statements.push(convertNamespace(result1));
      }
      const result2 = getChildByPaths(child.name, "interface");
      if (result2) {
        statements.push(result2.value);
      }
      const result3 = getChildByPaths(child.name, "typeAlias");
      if (result3) {
        statements.push(result3.value);
      }
      return statements;
    }, []);

    return statements.concat(state.additionalStatements);
  };

  return {
    hasStatement: (path: string, types: Structure.DataStructure.Kind[]): boolean => {
      const alreadyRegistered = types.some(type => !!operator.getChildByPaths(path, type));
      return alreadyRegistered;
    },
    addStatement: (path: string, params: Structure.ComponentParams): void => {
      operator.set(path, Structure.createInstance(params));
    },
    getStatement: <T extends Structure.DataStructure.Kind>(path: string, kind: T): Structure.DataStructure.GetChild<T> | undefined => {
      return getChildByPaths(path, kind);
    },
    getRootStatements,
    addAdditionalStatement: (statements: ts.Statement[]) => {
      state.additionalStatements = state.additionalStatements.concat(statements);
    },
    isAfterDefined,
  };
};
