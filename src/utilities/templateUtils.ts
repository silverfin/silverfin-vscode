import { posix } from "path";
import * as vscode from "vscode";
import * as utils from "./utils";

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
  utils.setCWD();
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
  utils.setCWD();
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
