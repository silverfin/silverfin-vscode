import { posix } from "path";
import * as vscode from "vscode";
import * as utils from "./utils";

// also update in utils.ts
export const FOLDERS = {
  reconciliationText: "reconciliation_texts",
  sharedPart: "shared_parts",
  exportFile: "export_files",
  accountTemplate: "account_templates",
};

export const TEMPLATE_TYPES = Object.keys(FOLDERS);

export const SILVERFIN_URL_PATHS = {
  reconciliationText: "reconciliation_texts",
  sharedPart: "shared_parts",
  exportFile: "export_files",
  accountTemplate: "account_detail_templates",
};

export const TEMPLATE_TYPES_NAMES = {
  reconciliationText: "Reconciliation text",
  sharedPart: "Shared part",
  exportFile: "Export file",
  accountTemplate: "Account template",
};

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
    element === "shared_parts" ||
    element === "reconciliation_texts" ||
    element === "export_files" ||
    element === "account_templates";
  const index = pathParts.findIndex(indexCheck);
  if (index === -1) {
    return false;
  }
  const templateHandle = pathParts[index + 1];
  return templateHandle;
}

// reconciliationText, sharedPart, exportFile, accountTemplate
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
  // Removed, we want to show parts next to every file (config.json, liquid tests, etc.)
  // if (fileType !== "liquid") {
  //   //vscode.window.showErrorMessage("File is not a liquid file");
  //   return false;
  // }
  if (fileParts.includes("reconciliation_texts")) {
    return "reconciliationText";
  } else if (fileParts.includes("shared_parts")) {
    return "sharedPart";
  } else if (fileParts.includes("export_files")) {
    return "exportFile";
  } else if (fileParts.includes("account_templates")) {
    return "accountTemplate";
  } else {
    return false;
  }
}

export async function getTemplateBasePath() {
  const cwd = utils.setCWD();
  const templateType = await getTemplateType();
  const templateHandle = getTemplateHandle();
  if (!cwd || !templateType || !templateHandle) {
    return false;
  }
  const templateBasePath = posix.join(
    cwd,
    FOLDERS[templateType],
    templateHandle
  );
  return templateBasePath;
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

export async function getTemplateLiquidCode() {
  utils.setCWD();
  if (!vscode.window.activeTextEditor) {
    return false;
  }
  const fileType = utils.getCurrentFileExtension();
  if (fileType !== "liquid") {
    return false;
  }
  return vscode.window.activeTextEditor.document.getText();
}

// Check if liquid tests file exists and return its paths
export async function getTemplateLiquidTestsPath() {
  try {
    utils.setCWD();
    if (!vscode.window.activeTextEditor) {
      return false;
    }
    const templateHandle = getTemplateHandle();
    if (!templateHandle) {
      return false;
    }
    const filePath = posix.resolve(
      vscode.window.activeTextEditor.document.uri.path
    );
    const fileParts = filePath.split(posix.sep);
    const indexCheck = (element: string) => element === templateHandle;
    const index = fileParts.findIndex(indexCheck);
    if (index === -1) {
      return false;
    }
    const templatePath = fileParts.slice(0, index + 1).join(posix.sep);
    const folderPath = posix.join(templatePath, "tests");
    const yamlPath = posix.join(
      folderPath,
      `${templateHandle}_liquid_test.yml`
    );
    const yamlUri = vscode.window.activeTextEditor.document.uri.with({
      path: yamlPath,
    });
    const yamlExists = await vscode.workspace.fs.stat(yamlUri);
    if (!yamlExists) {
      return false;
    }
    return yamlPath;
  } catch (error) {
    return false;
  }
}

async function getTemplateParts() {
  const templateConfigData = await getTemplateConfigData();
  return Object.keys(templateConfigData.text_parts);
}

async function createTemplatePart(partName: string) {
  const configPath = await getTemplateConfigPath();
  if (!configPath) {
    return false;
  }
  const templateConfigData = await getTemplateConfigData();
  const templateBasePath = await getTemplateBasePath();
  if (!templateConfigData || !templateBasePath) {
    return false;
  }
  const newPartPath = posix.join(
    templateBasePath,
    `text_parts`,
    `${partName}.liquid`
  );
  const newPartContent = Uint8Array.from(
    Buffer.from("{% comment %} New part {% endcomment %}", "utf8")
  );
  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(newPartPath),
    newPartContent
  );

  templateConfigData.text_parts[partName] = `text_parts/${partName}.liquid`;
  const newConfigData = Uint8Array.from(
    Buffer.from(JSON.stringify(templateConfigData, null, 2), "utf8")
  );
  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(configPath),
    newConfigData
  );

  return true;
}

export async function createTemplatePartPrompt() {
  utils.setCWD();

  const writableCheck = vscode.workspace.fs.isWritableFileSystem("file");
  if (!writableCheck) {
    vscode.window.showErrorMessage(
      `VS Code isn't able to create new files in this workspace.`
    );
    return false;
  }

  const templateType = await getTemplateType();
  const templateHandle = getTemplateHandle();
  const existingParts = await getTemplateParts();

  let newPartName = await vscode.window.showInputBox({
    prompt:
      "Enter the name of the new part. Use only letters, numbers and underscores.",
    placeHolder: "new_part_name",
    title: "NEW PART",
  });

  if (!newPartName) {
    return false;
  }
  if (existingParts.includes(newPartName)) {
    vscode.window.showErrorMessage(
      `Part "${newPartName}" already exists in this template`
    );
    return false;
  }
  const newPart = await createTemplatePart(newPartName);
  if (!newPart) {
    vscode.window.showErrorMessage(
      `Something went wrong while creating the part.`
    );
    return false;
  }
  vscode.window.showInformationMessage(
    `"${newPartName}" part created for "${templateHandle}" (${templateType})`
  );

  return true;
}
