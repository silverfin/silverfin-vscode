import { posix } from "path";
import * as vscode from "vscode";

// Find in which row of the document a text is located
// It will return only the first match if repeated
export function findIndexRow(
  document: vscode.TextDocument,
  reExpresion: string,
  startIndex: number = 0
): number {
  let lineIndex = startIndex;
  const documentLastRow = document.lineCount - 1;
  const re = new RegExp(reExpresion);
  for (lineIndex; lineIndex < documentLastRow; lineIndex++) {
    let lineText = document.lineAt(lineIndex).text;
    let regExpTest = lineText.match(re);
    if (regExpTest) {
      return lineIndex;
    }
  }
  return 0;
}

// Set the CWD to the root of the repostory
// If it cannot identify the root, it will return false
export function setCWD() {
  if (!vscode.window.activeTextEditor) {
    return false;
  }
  const filePath = posix.resolve(
    vscode.window.activeTextEditor.document.uri.path
  );
  const pathParts = filePath.split(posix.sep);
  const indexCheck = (element: string) =>
    element === "shared_parts" || element === "reconciliation_texts";
  const index = pathParts.findIndex(indexCheck);
  if (index === -1) {
    return false;
  }
  const newCwdParts = pathParts.slice(0, index);
  const newCwdPath = posix.resolve(newCwdParts.join(posix.sep));

  const currentCwd = process.cwd();
  if (currentCwd !== newCwdPath) {
    process.chdir(newCwdPath);
    //console.log("CWD set to: " + newCwdPath);
  }
  return newCwdPath;
}
