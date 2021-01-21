import * as path from "path";

import { fileSystem } from "../FileSystem";
import * as Guard from "./Guard";
import type * as Types from "../types";

export interface LocalReference {
  type: "local";
  name: string;
  path: string;
}

export interface RemoteReference<T> {
  type: "remote";
  referencePoint: string;
  path: string;
  name: string;
  data: T;
}

export type Type<T> = LocalReference | RemoteReference<T>;

export const generateLocalReference = (reference: Types.Reference): LocalReference | undefined => {
  if (!reference.$ref.startsWith("#/")) {
    return;
  }
  const name = reference.$ref.split("#/")[1];
  return {
    type: "local",
    name,
    path: name,
  };
};

export const generateReferencePoint = (currentPoint: string, reference: Types.Reference): string => {
  const basedir = path.dirname(currentPoint);
  const ref = reference.$ref;
  const referencePoint = path.join(basedir, ref);
  return referencePoint;
};

export const generate = <T>(entryPoint: string, currentPoint: string, reference: Types.Reference): Type<T> => {
  const localReference = generateLocalReference(reference);
  if (localReference) {
    return localReference;
  }

  if (reference.$ref.startsWith("http")) {
    throw new Error("Please Pull Request ! Welcome !");
  }

  const referencePoint = generateReferencePoint(currentPoint, reference);

  if (!fileSystem.existSync(referencePoint)) {
    throw new Error(`Not found reference point from current point. \n Path: ${referencePoint}`);
  }

  const relativePathFromEntryPoint = path.relative(path.dirname(entryPoint), referencePoint); // components/hoge/fuga.yml
  const ext = path.extname(relativePathFromEntryPoint); // .yml
  const pathArray: string[] = relativePathFromEntryPoint.replace(ext, "").split("/"); // ["components", "hoge", "fuga"]
  const targetPath: string = pathArray.join("/"); // components/hoge/fuga
  const schemaName = pathArray[pathArray.length - 1]; // fuga
  const data = fileSystem.loadJsonOrYaml(referencePoint);

  if (Guard.isReference(data)) {
    return generate<T>(entryPoint, referencePoint, data);
  }

  if (!targetPath.startsWith("components")) {
    throw new Error(`targetPath is not start "components":\n${targetPath}`);
  }

  return {
    type: "remote",
    referencePoint,
    path: targetPath,
    name: schemaName,
    data,
  };
};

export const resolveRemoteReference = (
  entryPoint: string,
  currentPoint: string,
  reference: Types.Reference,
): { referencePoint: string; data: any } => {
  if (reference.$ref.startsWith("#") || reference.$ref.startsWith("http")) {
    return { referencePoint: currentPoint, data: reference };
  }
  const referencePoint = generateReferencePoint(currentPoint, reference);
  if (!fileSystem.existSync(referencePoint)) {
    throw new Error(`Not found reference point from current point. \n Path: ${referencePoint}`);
  }
  const data = fileSystem.loadJsonOrYaml(referencePoint);
  if (Guard.isReference(data)) {
    return resolveRemoteReference(entryPoint, referencePoint, data);
  }
  return {
    referencePoint,
    data,
  };
};

export const resolveLocalReference = (entryPoint: string, currentPoint: string, reference: Types.Reference): any => {
  if (!reference.$ref.startsWith("#")) {
    return reference;
  }
  const referencePoint = generateReferencePoint(currentPoint, reference);
  const data = fileSystem.loadJsonOrYaml(referencePoint);
  if (Guard.isReference(data)) {
    return resolveRemoteReference(entryPoint, referencePoint, data);
  }
  return data;
};
