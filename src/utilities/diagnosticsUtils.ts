import * as vscode from "vscode";
import * as types from "../lib/types";

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

// From the Messaage of the error, extract the expected and got values
// Return: [expected, got]
export function getExpectedGotFromMessage(message: string): string[] {
  const output = [];
  const expectedRegex = /Expected:\s*([^(]+)/g;
  const expectedMatch = message.match(expectedRegex);
  if (expectedMatch) {
    output.push(expectedMatch[0].replace("Expected: ", ""));
  } else {
    output.push("");
  }
  const gotRegex = /Got:\s*([^(]+)/g;
  const gotMatch = message.match(gotRegex);
  if (gotMatch) {
    output.push(gotMatch[0].replace("Got: ", ""));
  } else {
    output.push("");
  }
  return output;
}
