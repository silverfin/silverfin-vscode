import * as vscode from "vscode";
import * as templateUtils from "../utilities/templateUtils";
import SilverfinToolkit from "./silverfinToolkit";

/**
 * QuickPick for the user.
 * It will list all the shared parts available (except the ones already added to the template) in the firm and prompt the user to select which ones to add.
 * It works with the template open in the current ActiveTextEditor.
 * It will perform the Silverfin API calls to add each selected shared part to the template.
 * @param firmId
 * @returns boolean
 */
export async function addSharedPartPrompt(firmId: Number) {
  const templateType = await templateUtils.getTemplateType();
  const templateHandle = await templateUtils.getTemplateHandle();
  if (!templateType || !templateHandle) {
    return false;
  }

  const allExistingSharedParts =
    SilverfinToolkit.fsUtils.getAllTemplatesOfAType("sharedPart");
  const sharedPartsUsed =
    SilverfinToolkit.fsUtils.listSharedPartsUsedInTemplate(
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
    SilverfinToolkit.toolkit.addSharedPart(
      "firm",
      firmId,
      sharedPartName,
      templateHandle,
      templateType
    );
  });
  return true;
}

/**
 * QuickPick for the user.
 * It will list all the shared parts used in the template and prompt the user to select which ones to remove.
 * It works with the template open in the current ActiveTextEditor.
 * It will perform the Silverfin API calls to remove each selected shared part from the template.
 * @param firmId
 * @returns boolean
 */
export async function removeSharedPartsPrompt(firmId: Number) {
  const templateType = await templateUtils.getTemplateType();
  const templateHandle = await templateUtils.getTemplateHandle();
  if (!templateType || !templateHandle) {
    return false;
  }

  const sharedPartsUsed =
    SilverfinToolkit.fsUtils.listSharedPartsUsedInTemplate(
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
    SilverfinToolkit.toolkit.removeSharedPart(
      "firm",
      firmId,
      sharedPartName,
      templateHandle,
      templateType
    );
  });
  return true;
}
