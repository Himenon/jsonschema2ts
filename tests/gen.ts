import * as fs from "fs";
import { generateFromJsonSchema } from "../src";

const jsonSchema = JSON.parse(fs.readFileSync(__dirname + "/schema.json", { encoding: "utf-8" }));

const main = () => {
  const result = generateFromJsonSchema(jsonSchema);
  fs.writeFileSync(__dirname + "/output.ts", result, { encoding: "utf-8" });
};

main();
