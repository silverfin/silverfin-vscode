import * as vscode from "vscode";
import * as utils from "./utils";
const sfToolkit = require("sf_toolkit");
const { config } = require("sf_toolkit/api/auth");

export default class FirmHandler {
  commandName = "silverfin-development-toolkit.setFirm";
  output: vscode.OutputChannel;
  credentials: boolean;
  constructor(outputChannel: vscode.OutputChannel) {
    this.output = outputChannel;
    this.credentials = this.checkAPICredentials();
  }

  public async setFirmIdCommand() {
    // Set right path
    const check = await utils.checkFilePath();
    if (!check) {
      return;
    }
    // Get Firm Stored
    let firmIdStored = await sfToolkit.getDefaultFirmID();
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

  private checkAPICredentials() {
    // API Credentials
    const credentials =
      process.env.SF_API_CLIENT_ID && process.env.SF_API_SECRET ? true : false;

    // Set Context Key
    // We can use this key in package.json menus.commandPalette to show/hide our commands
    vscode.commands.executeCommand(
      "setContext",
      "silverfin-development-toolkit.apiAuthorized",
      credentials
    );

    this.output.appendLine(`Credentials stored: ${credentials}`);
    return credentials;
  }
}
