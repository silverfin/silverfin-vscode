import { posix } from "path";
import * as vscode from "vscode";

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
