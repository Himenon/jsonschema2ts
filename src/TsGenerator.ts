import ts from "typescript";

export type TransformerFactory<T extends ts.Node> = ts.TransformerFactory<T>;
export type CreateFunction = (context: ts.TransformationContext) => ts.Statement[];

export const traverse = (create: CreateFunction) => <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
  const visit = (node: ts.Node): ts.Node => {
    if (!ts.isSourceFile(node)) {
      return node;
    }
    return context.factory.updateSourceFile(
      node,
      create(context),
      node.isDeclarationFile,
      node.referencedFiles,
      node.typeReferenceDirectives,
      node.hasNoDefaultLib,
      node.libReferenceDirectives,
    );
  };
  return ts.visitNode(rootNode, visit);
};

export const convertAstToTypeScriptCode = (sourceFile: ts.SourceFile): string => {
  const printer = ts.createPrinter(); // AST -> TypeScriptに変換
  return printer.printFile(sourceFile);
};

export const generate = (createFunction: CreateFunction): string => {
  const source = ts.createSourceFile("", "", ts.ScriptTarget.ESNext);
  const transformers: TransformerFactory<ts.SourceFile>[] = [traverse(createFunction)];
  const result = ts.transform(source, transformers);
  result.dispose();
  if (result.transformed.length > 1) {
    throw new Error("");
  }
  return convertAstToTypeScriptCode(result.transformed[0]);
};
