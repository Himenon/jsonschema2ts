import * as fs from "fs";
import { generateFromJsonSchema, generateFromFile } from "../src";

const main = () => {
  fs.mkdirSync(__dirname + "/output", { recursive: true });
  const jsonSchema = JSON.parse(fs.readFileSync(__dirname + "/schema/only-local-ref-root.json", { encoding: "utf-8" }));
  const result1 = generateFromJsonSchema(jsonSchema);
  fs.writeFileSync(__dirname + "/output/OnlyLocalRef.ts", result1, { encoding: "utf-8" });

  const result = generateFromFile(__dirname + "/schema/remote-ref-root.json");
  fs.writeFileSync(__dirname + "/output/RemoteRef.ts", result, { encoding: "utf-8" });
};

main();
