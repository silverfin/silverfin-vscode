import { posix } from "path";
import * as vscode from "vscode";
import * as types from "./types";

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
  process.chdir(newCwdPath);
  //console.log("CWD set to: " + newCwdPath);
  return newCwdPath;
}

// Get template handle from file path
// Identify template handle from text_parts or main
export function getTemplateHandle() {
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
  const templateHandle = pathParts[index + 1];
  return templateHandle;
}

// reconciliationText or sharedPart
export async function getTemplateType() {
  if (!vscode.window.activeTextEditor) {
    return false;
  }
  const filePath = posix.resolve(
    vscode.window.activeTextEditor.document.uri.path
  );
  const fileParts = filePath.split(posix.sep);
  const fileName = fileParts[fileParts.length - 1];
  const fileType = fileName.split(".")[1];
  if (fileType !== "liquid") {
    //vscode.window.showErrorMessage("File is not a liquid file");
    return false;
  }
  if (fileParts.includes("reconciliation_texts")) {
    return "reconciliationText";
  } else if (fileParts.includes("shared_parts")) {
    return "sharedPart";
  } else {
    return false;
  }
}

// Check if Config file exists and return its paths
export async function getTemplateConfigPath() {
  if (!vscode.window.activeTextEditor) {
    return false;
  }
  const templateHanlde = getTemplateHandle();
  if (!templateHanlde) {
    return false;
  }
  const filePath = posix.resolve(
    vscode.window.activeTextEditor.document.uri.path
  );
  const fileParts = filePath.split(posix.sep);
  const indexCheck = (element: string) => element === templateHanlde;
  const index = fileParts.findIndex(indexCheck);
  if (index === -1) {
    return false;
  }
  const templatePath = fileParts.slice(0, index + 1).join(posix.sep);
  const configPath = posix.join(templatePath, "config.json");
  const configUri = vscode.window.activeTextEditor.document.uri.with({
    path: configPath,
  });
  const configExists = await vscode.workspace.fs.stat(configUri);
  if (!configExists) {
    return false;
  }
  return configPath;
}

export async function getTemplateConfigData() {
  if (!vscode.window.activeTextEditor) {
    return false;
  }
  const templateType = await getTemplateType();
  const templateHandle = getTemplateHandle();
  if (!templateType || !templateHandle) {
    return false;
  }
  const templateConfigPath = await getTemplateConfigPath();
  if (!templateConfigPath) {
    return false;
  }
  const configUri = vscode.window.activeTextEditor.document.uri.with({
    path: templateConfigPath,
  });
  const configTextDocument = await vscode.workspace.openTextDocument(configUri);
  if (!configTextDocument) {
    return false;
  }
  return JSON.parse(configTextDocument.getText());
}
