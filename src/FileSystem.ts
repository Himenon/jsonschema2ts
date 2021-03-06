import * as fs from "fs";
import * as path from "path";

import Dot from "dot-prop";
import * as yaml from "js-yaml";

export interface Type {
  existSync: (entrypoint: string) => boolean;
  loadJsonOrYaml: (entryPoint: string) => any;
}

const create = (): Type => {
  const FRAGMENT = "#/";

  const loadJsonOrYaml = (filename: string): any => {
    const ext = path.extname(filename);
    const data = fs.readFileSync(filename, { encoding: "utf-8" });
    switch (ext) {
      case ".json":
        try {
          return JSON.parse(data);
        } catch (error) {
          throw new Error(`Error in ${filename}`);
        }
      case ".yml":
      case ".yaml":
        return yaml.load(data);
      default:
        throw new Error(`Not support file: ${filename}`);
    }
  };
  return {
    existSync: (entryPoint: string): boolean => {
      return !!(fs.existsSync(entryPoint) && fs.statSync(entryPoint).isFile());
    },
    loadJsonOrYaml: (entryPoint: string): any => {
      const hasFragment: boolean = new RegExp(FRAGMENT).test(entryPoint);
      if (hasFragment) {
        const [filename, fragment] = entryPoint.split(FRAGMENT);
        const data = loadJsonOrYaml(filename);
        return Dot.get(data, fragment.replace(/\//g, "."));
      }
      return loadJsonOrYaml(entryPoint);
    },
  };
};

export const fileSystem = create();
