const sfCli = require("silverfin-cli");
import * as vscode from "vscode";
import * as templateUtils from "../utilities/templateUtils";
import FirmHandler from "./firmHandler";
import ExtensionLogger from "./outputChannels/extensionLogger";
import UserLogger from "./outputChannels/userLogger";

export default class TemplateUpdater {
  private extensionLogger: ExtensionLogger = ExtensionLogger.plug();
  private userLogger: UserLogger = UserLogger.plug();
  private firmHandler: FirmHandler = FirmHandler.plug();
  firmId: Number | undefined = undefined;
  constructor() {}

  async pushToSilverfin(filePath: string) {
    this.firmId = await this.firmHandler.setFirmID();
    const templateHandle = await templateUtils.getTemplateHandle(filePath);
    const templateType = await templateUtils.getTemplateType(filePath);
    const parameters = {
      firmId: this.firmId,
      templateHandle,
      templateType
    };
    if (!this.firmId || !templateHandle || !templateType) {
      this.extensionLogger.log(
        "Could not push to Silverfin. Parameter missing",
        parameters
      );
      return false;
    }
    const message = "Update pushed from VSCode";
    let updateFunction;
    switch (templateType) {
      case "reconciliationText":
        updateFunction = sfCli.publishReconciliationByHandle;
        break;
      case "sharedPart":
        updateFunction = sfCli.publishSharedPartByName;
        break;
      case "exportFile":
        updateFunction = sfCli.publishExportFileByName;
        break;
      case "accountTemplate":
        updateFunction = sfCli.publishAccountTemplateByName;
        break;
    }
    const functionName = updateFunction.name;
    this.extensionLogger.log("Updating template", { parameters, functionName });

    const updated = await updateFunction(this.firmId, templateHandle, message);
    this.extensionLogger.log("Template updated?", {
      parameters,
      functionName,
      updated
    });
    this.displayUserMessage(updated, templateHandle, templateType);
  }

  private displayUserMessage(
    updated: boolean,
    templateHandle: string,
    templateType: string
  ) {
    if (updated) {
      this.userLogger.log(
        `${templateHandle} (${this.templateTypeMapper[templateType]}) updated in firm ${this.firmId}`
      );
    } else {
      vscode.window.showErrorMessage(
        `Update failed for ${templateHandle}. Use the CLI to get more details about the issue. If the issue persists, try to authorize firm ${this.firmId} again.`
      );
    }
  }

  private templateTypeMapper: { [index: string]: string } = {
    reconciliationText: "Reconciliation Text",
    sharedPart: "Shared Part",
    accountTemplate: "Account Template",
    exportFile: "Export File"
  };
}
