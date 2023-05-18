import { posix } from "path";
import * as vscode from "vscode";
import * as types from "../lib/types";

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

// Load the Diagnostic stored from previous runs
// Check file, look for stored data, parse it, create collection
// Return the collection as array for further use if needed
export async function loadStoredDiagnostics(
  currentDocument: vscode.TextDocument,
  outputChannel: vscode.OutputChannel,
  context: vscode.ExtensionContext,
  errorsCollection: vscode.DiagnosticCollection
) {
  // Check if yaml
  if (
    currentDocument.fileName.split(".")[
      currentDocument.fileName.split(".").length - 1
    ] !== "yml"
  ) {
    return;
  }
  // Open Diagnostic Stored in Global State
  let storedDiagnostics: types.StoredDiagnostic[] | undefined =
    await context.globalState.get(currentDocument.uri.toString());
  outputChannel.appendLine(
    `[Stored diagnostics] loaded: ${JSON.stringify(currentDocument.fileName)}`
  );
  if (storedDiagnostics) {
    // Recreate Diagnostic Objects
    let collectionArray: types.DiagnosticObject[] = [];
    for (let diagnosticStored of storedDiagnostics) {
      let diagnosticRecreated = types.diagnosticParser(diagnosticStored);
      collectionArray.push(diagnosticRecreated);
    }
    // Load the Diagnostics
    errorsCollection.set(currentDocument.uri, collectionArray);
    return collectionArray;
  }
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
