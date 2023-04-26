import { posix } from "path";
import * as vscode from "vscode";
import * as yaml from "yaml";
import * as types from "./types";

export let firstRowRange: vscode.Range = new vscode.Range(
  new vscode.Position(0, 0),
  new vscode.Position(0, 500)
);

// Get template handle from file path
export async function getTemplateHandle() {
  // File information
  if (!vscode.window.activeTextEditor) {
    return;
  }
  const filePath = posix.resolve(
    vscode.window.activeTextEditor.document.uri.path
  );
  const pathParts = posix.dirname(filePath).split(posix.sep);
  const templateHandle = pathParts[pathParts.length - 2];
  return templateHandle;
}

// Check open file is a Liquid Test
// Check right folder structure && type YAML
export async function checkFilePath() {
  // File information
  if (!vscode.window.activeTextEditor) {
    return false;
  }
  const filePath = posix.resolve(
    vscode.window.activeTextEditor.document.uri.path
  );
  const fileBasename = posix.basename(filePath);
  const pathParts = posix.dirname(filePath).split(posix.sep);

  // Check /tests directory
  if (pathParts[pathParts.length - 1] !== "tests") {
    vscode.window.showErrorMessage(
      'File is not stored in a "./tests" directory'
    );
    return false;
  }

  // Get Template Handle
  const templateHandle = pathParts[pathParts.length - 2];
  const templatePath = posix.dirname(posix.dirname(filePath));

  // Check file name
  const nameRe = new RegExp(`${templateHandle}_liquid_test.yml`);
  const matchName = fileBasename.match(nameRe);
  if (!matchName) {
    vscode.window.showErrorMessage(
      "File name is not correct: [handle]_liquid_test.yml"
    );
    return false;
  }

  // Check Config File
  const configPath = posix.join(templatePath, "config.json");
  const configUri = vscode.window.activeTextEditor.document.uri.with({
    path: configPath,
  });
  try {
    await vscode.workspace.fs.stat(configUri);
  } catch (error) {
    vscode.window.showErrorMessage("Config.json is missing");
    return false;
  }
  // Set the right path
  const basePath = posix.dirname(posix.dirname(templatePath));
  process.chdir(basePath);
  return true;
}

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
  // outputChannel.appendLine(
  //   `Stored Diagnostics: ${JSON.stringify(storedDiagnostics)}`
  // );
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

// Diagnostic Collection Filter
// Compare the current document with the stored diagnostics
// Filter those that are no longer relevant
export function filterFixedDiagnostics(
  currentDocument: vscode.TextDocument,
  outputChannel: vscode.OutputChannel,
  context: vscode.ExtensionContext,
  errorsCollection: vscode.DiagnosticCollection,
  storedDiagnostics: types.DiagnosticObject[]
) {
  let collectionArray: types.DiagnosticObject[] = [];
  for (let diagnosticStored of storedDiagnostics) {
    let testRow = currentDocument.getText(diagnosticStored.range);
    let testRowExpectation = testRow.split(":")[1].trim();
    if (testRowExpectation.toString() !== diagnosticStored.source.toString()) {
      collectionArray.push(diagnosticStored);
    }
  }
  errorsCollection.set(currentDocument.uri, []);
  errorsCollection.set(currentDocument.uri, collectionArray);
}

// Return an array with the names of the unit tests and the row where they are located
export function findTestNamesAndRows(document: vscode.TextDocument) {
  const testContent = document.getText();
  const testYAML = yaml.parse(testContent);
  const testNames = Object.keys(testYAML);
  const testRows = testContent.split("\n");
  const indexes: { [index: string]: number } = {};
  testNames.forEach((testName) => {
    let index = testRows.findIndex((element) => element.includes(testName));
    indexes[testName] = index;
  });
  return indexes;
}

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
  console.log("CWD set to: " + newCwdPath);
  return newCwdPath;
}
