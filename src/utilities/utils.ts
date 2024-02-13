import { posix } from "path";
import * as vscode from "vscode";

const FOLDERS = [
  "reconciliation_texts",
  "shared_parts",
  "export_files",
  "account_templates"
];

/**
 * Find in which row of the document a text is located
 * It will return only the first match if repeated
 * @param document - The document to search
 * @param reExpresion - The regular expression to search
 * @param startIndex - The row to start searching
 * @returns - The row index where the text is located
 */
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

/**
 * Set the CWD to the root of the repostory.
 * It will look at the path of the current file (activeTextEditor) and identify the root of the repository
 * If it cannot identify the root, it will return false
 */
export function setCWD() {
  if (!vscode.window.activeTextEditor) {
    return false;
  }
  const filePath = posix.resolve(
    vscode.window.activeTextEditor.document.uri.path
  );
  const pathParts = filePath.split(posix.sep);
  const indexCheck = (element: string) => FOLDERS.includes(element);
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

/**
 * Get the file extension of the current file (activeTextEditor)
 * @returns The file extension of the current file
 */
export function getCurrentFileExtension() {
  if (!vscode.window.activeTextEditor) {
    return false;
  }
  const filePath = posix.resolve(
    vscode.window.activeTextEditor.document.uri.path
  );
  const pathParts = filePath.split(posix.sep);
  const fileName = pathParts[pathParts.length - 1];
  const fileType = fileName.split(".")[1];
  return fileType;
}
