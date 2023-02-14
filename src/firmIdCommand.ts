import * as vscode from "vscode";
import * as utils from "./utils";
const sfToolkit = require("sf_toolkit");
const { config } = require("sf_toolkit/api/auth");

export default class FirmIdCommand {
  constructor(context: vscode.ExtensionContext) {
    this.registerCommand(
      context,
      "silverfin-development-toolkit.setFirm",
      this.setFirmCommandHandler
    );
  }
  // Set Firm ID Command
  private async setFirmCommandHandler() {
    // Set right path
    const check = await utils.checkFilePath();
    if (!check) {
      return;
    }
    // Get Firm Stored
    let firmIdStored = await sfToolkit.getDefaultFirmID();
    console.log(firmIdStored);
    let promptMessage;
    if (!firmIdStored) {
      promptMessage =
        "Provide a new firm ID (currently, there is no ID stored)";
    } else {
      promptMessage = `Provide a new firm ID (this will overwrite the existing ID:${firmIdStored}) `;
    }
    // Request Firm ID and store it
    const newFirmId = await vscode.window.showInputBox({
      prompt: promptMessage,
      placeHolder: "123456",
      title: "STORE FIRM ID",
    });
    // Empty prompt
    if (!newFirmId) {
      return;
    }
    // Store the new firm id provided
    await sfToolkit.setDefaultFirmID(newFirmId);
    vscode.window.showInformationMessage(
      `Firm ID ${newFirmId} stored succesfully`
    );
    // Check firm id's credentials
    const firmCredentials = config.getTokens(newFirmId);
    if (!firmCredentials) {
      vscode.window.showErrorMessage(
        "Use the CLI to authorize the firm ID provided"
      );
      return;
    }
  }
  private registerCommand(
    context: vscode.ExtensionContext,
    commandName: string,
    handler: any
  ) {
    context.subscriptions.push(
      vscode.commands.registerCommand(commandName, handler)
    );
  }
}
