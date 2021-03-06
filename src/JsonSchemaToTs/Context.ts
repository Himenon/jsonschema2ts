import * as Path from "path";

import ts from "typescript";

import * as Factory from "../Factory";
import * as Store from "./Store";
import * as ToTypeNode from "./TypeNode";

export interface ReferencePathSet {
  pathArray: string[];
  base: string;
}

const factory = Factory.create();

const TARGET_SCHEMAS = ["properties", "definitions"];

const generatePath = (entryPoint: string, currentPoint: string, referencePath: string): ReferencePathSet => {
  const ext = Path.extname(currentPoint); // .yml
  const from = Path.relative(Path.dirname(entryPoint), currentPoint).replace(ext, ""); // components/schemas/A/B
  const base = Path.dirname(from);
  const result = Path.relative(base, referencePath); // remoteの場合? localの場合 referencePath.split("/")
  const pathArray = result.split("/");
  return {
    pathArray,
    base,
  };
};

const calculateReferencePath = (store: Store.Type, base: string, pathArray: string[]): ToTypeNode.ResolveReferencePath => {
  let names: string[] = [];
  let unresolvedPaths: string[] = [];
  pathArray.reduce((previous, lastPath, index) => {
    const current = Path.join(previous, lastPath);
    // ディレクトリが深い場合は相対パスが`..`を繰り返す可能性があり、
    // その場合はすでに登録されたnamesを削除する
    if (lastPath === ".." && names.length > 0) {
      names = names.slice(0, names.length - 1);
    }
    const isFinalPath = index === pathArray.length - 1;
    if (isFinalPath) {
      const statement = store.getStatement(current, "interface");
      const statement2 = store.getStatement(current, "typeAlias");
      const statement3 = store.getStatement(current, "namespace");
      if (statement) {
        names.push(statement.name);
        return current;
      } else if (statement2) {
        names.push(statement2.name);
        return current;
      } else if (statement3) {
        names.push(statement3.name);
        return current;
      } else {
        unresolvedPaths.push(lastPath);
      }
    } else {
      const statement = store.getStatement(current, "namespace");
      if (statement) {
        unresolvedPaths = unresolvedPaths.slice(0, unresolvedPaths.length - 1);
        names.push(statement.name);
      } else {
        unresolvedPaths.push(lastPath);
      }
    }
    return current;
  }, base);
  let maybeResolvedName: string;
  if (TARGET_SCHEMAS.includes(unresolvedPaths[0])) {
    maybeResolvedName = names.concat(unresolvedPaths.slice(1, unresolvedPaths.length)).join(".");
  } else {
    maybeResolvedName = names.concat(unresolvedPaths).join(".");
  }
  return {
    name: names.join("."),
    maybeResolvedName,
    unresolvedPaths,
  };
};

export const create = (entryPoint: string, store: Store.Type, isOnlyLocalReference: boolean): ToTypeNode.Context => {
  const resolveReferencePath: ToTypeNode.Context["resolveReferencePath"] = (currentPoint, referencePath) => {
    const { pathArray, base } = generatePath(entryPoint, currentPoint, referencePath);
    return calculateReferencePath(store, base, pathArray);
  };
  const setReferenceHandler: ToTypeNode.Context["setReferenceHandler"] = (currentPoint, reference) => {
    if (store.hasStatement(reference.path, ["interface", "typeAlias"])) {
      return;
    }
    if (reference.type === "remote") {
      const typeNode = ToTypeNode.convert(
        entryPoint,
        reference.referencePoint,
        reference.data,
        {
          setReferenceHandler,
          resolveReferencePath,
          isOnlyLocalReference,
        },
        isOnlyLocalReference,
      );
      if (ts.isTypeLiteralNode(typeNode)) {
        store.addStatement(reference.path, {
          kind: "interface",
          name: reference.name,
          value: factory.InterfaceDeclaration.create({
            export: true,
            name: reference.name,
            members: typeNode.members,
          }),
        });
      } else {
        const value = factory.TypeAliasDeclaration.create({
          export: true,
          name: reference.name,
          type: ToTypeNode.convert(
            entryPoint,
            reference.referencePoint,
            reference.data,
            {
              setReferenceHandler,
              resolveReferencePath,
              isOnlyLocalReference,
            },
            isOnlyLocalReference,
          ),
        });
        store.addStatement(reference.path, {
          name: reference.name,
          kind: "typeAlias",
          value,
        });
      }
    } else if (reference.type === "local") {
      if (!store.isAfterDefined(reference.path)) {
        const { maybeResolvedName } = resolveReferencePath(currentPoint, reference.path);
        const value = factory.TypeAliasDeclaration.create({
          export: true,
          name: reference.name,
          type: factory.TypeReferenceNode.create({
            name: maybeResolvedName,
          }),
        });
        store.addStatement(reference.path, {
          name: reference.name,
          kind: "typeAlias",
          value,
        });
      }
    }
  };
  return { setReferenceHandler: setReferenceHandler, resolveReferencePath: resolveReferencePath, isOnlyLocalReference };
};
