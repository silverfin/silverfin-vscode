import * as vscode from "vscode";
import * as utils from "../utilities/utils";
const sfToolkit = require("sf_toolkit");
const { config } = require("sf_toolkit/lib/api/auth");

export default class FirmHandler {
  commandName = "silverfin-development-toolkit.setFirm";
  output: vscode.OutputChannel;
  credentials: boolean;
  statusBarItem: any;
  constructor(outputChannel: vscode.OutputChannel) {
    this.output = outputChannel;
    this.credentials = this.checkAPICredentials();
  }

  public async setFirmIdCommand() {
    // Set right path
    const check = utils.setCWD();
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
    // Refresh the Firm Panel (to update the Active label)
    vscode.commands.executeCommand("firm-panel.refresh");
    return true;
  }

  // Get Firm ID or set a new one via Prompt
  public async setFirmID() {
    utils.setCWD();
    let firmId: Number = config.getFirmId();
    // Request Firm ID and store it if necessary
    if (!firmId) {
      let newFirmId = await vscode.window.showInputBox({
        prompt:
          "There is no Firm ID stored. Provide one to run the liquid test",
        placeHolder: "123456",
        title: "FIRM ID",
      });
      let newFirmIdNumber = Number(newFirmId);
      // No valid firm id provided via prompt
      if (!newFirmIdNumber) {
        if (this.statusBarItem) {
          this.statusBarItem.setStateIdle();
        }
        return;
      }
      // Store and use new firm id provided
      await config.setFirmId(newFirmIdNumber);
      firmId = newFirmIdNumber;
    }
    return firmId;
  }

  public async checkFirmCredentials() {
    utils.setCWD();
    const firmIdStored = config.getFirmId();
    const firmCredentials = config.getTokens(firmIdStored);
    if (!firmCredentials) {
      vscode.window.showErrorMessage(
        `Firm ID: ${firmIdStored}. You first need to authorize your firm using the CLI`
      );
      this.output.appendLine(
        `Firm ID: ${firmIdStored}. Pair of access/refresh tokens missing from config`
      );
      return false;
    }
    return true;
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
