import * as fs from "fs";
import * as path from "path";

describe("Generate Code Snapshot Test", () => {
  test("OnlyLocalRef.ts", () => {
    const code = fs.readFileSync(path.join(__dirname, "../output/OnlyLocalRef.ts"), { encoding: "utf-8" });
    expect(code).toMatchSnapshot();
  });
  test("RemoteRef.ts", () => {
    const code = fs.readFileSync(path.join(__dirname, "../output/RemoteRef.ts"), { encoding: "utf-8" });
    expect(code).toMatchSnapshot();
  });
});
