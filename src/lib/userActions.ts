import * as vscode from "vscode";
import * as templateUtils from "../utilities/templateUtils";
const sfCliFsUtils = require("silverfin-cli/lib/utils/fsUtils");
const sfCli = require("silverfin-cli");

export async function addSharedPartPrompt(firmId: Number) {
  const templateType = await templateUtils.getTemplateType();
  const templateHandle = await templateUtils.getTemplateHandle();
  if (!templateType || !templateHandle) {
    return false;
  }

  const allExistingSharedParts =
    sfCliFsUtils.getAllTemplatesOfAType("sharedPart");
  const sharedPartsUsed = sfCliFsUtils.listSharedPartsUsedInTemplate(
    firmId,
    templateType,
    templateHandle
  );
  const sharedPartsNotUsed = allExistingSharedParts.filter(
    (sharedPart: string) => !sharedPartsUsed.includes(sharedPart)
  );
  const selectedSharedParts = await vscode.window.showQuickPick(
    sharedPartsNotUsed,
    { canPickMany: true }
  );

  if (!selectedSharedParts || selectedSharedParts.length === 0) {
    return false;
  }

  selectedSharedParts.forEach((sharedPartName) => {
    sfCli.addSharedPart(firmId, sharedPartName, templateHandle, templateType);
  });
  return true;
}

export async function removeSharedPartsPrompt(firmId: Number) {
  const templateType = await templateUtils.getTemplateType();
  const templateHandle = await templateUtils.getTemplateHandle();
  if (!templateType || !templateHandle) {
    return false;
  }

  const sharedPartsUsed = sfCliFsUtils.listSharedPartsUsedInTemplate(
    firmId,
    templateType,
    templateHandle
  );
  const selectedSharedParts = await vscode.window.showQuickPick(
    sharedPartsUsed,
    { canPickMany: true }
  );
  if (!selectedSharedParts || selectedSharedParts.length === 0) {
    return false;
  }

  selectedSharedParts.forEach((sharedPartName) => {
    sfCli.removeSharedPart(
      firmId,
      sharedPartName,
      templateHandle,
      templateType
    );
  });
  return true;
}
