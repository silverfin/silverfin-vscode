const sfCli = require("silverfin-cli");
import * as vscode from "vscode";
import * as templateUtils from "../utilities/templateUtils";

export class TemplateUpdater {
  output: vscode.OutputChannel;
  firmHandler: any;
  firmId: Number | undefined = undefined;
  constructor(firmHandler: any, outputChannel: vscode.OutputChannel) {
    this.firmHandler = firmHandler;
    this.output = outputChannel;
  }

  async pushToSilverfin() {
    this.firmId = await this.firmHandler.setFirmID();
    const templateHandle = await templateUtils.getTemplateHandle();
    const templateType = await templateUtils.getTemplateType();
    const parameters = {
      firmId: this.firmId,
      templateHandle,
      templateType,
    };
    if (!this.firmId || !templateHandle || !templateType) {
      this.outputLog(
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
        updateFunction = sfCli.publishSharedPartByHandle;
        break;
      case "exportFile":
        updateFunction = sfCli.publishExportFileByName;
        break;
      // case "accountTemplate":
      //   updateFunction = sfCli.publishAccountTemplateByName;
      //   break;
    }
    const functionName = updateFunction.name;
    this.outputLog("Updating template", { parameters, functionName });
    const updated = await updateFunction(this.firmId, templateHandle, message);
    this.outputLog("Template updated?", {
      parameters,
      functionName,
      updated,
    });
    this.updateMessage(updated, templateHandle);
  }

  private outputLog(message: string, object: object) {
    this.output.appendLine(
      `[Template Updater] ${message}. ${JSON.stringify({ object })}`
    );
  }

  private updateMessage(updated: boolean, templateHandle: string) {
    if (updated) {
      vscode.window.showInformationMessage(
        `${templateHandle} updated in firm ${this.firmId}`
      );
    }
  }
}
