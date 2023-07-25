import * as vscode from "vscode";
import * as utils from "../utilities/utils";
const { firmCredentials } = require("sf_toolkit/lib/api/firmCredentials");
const sfApi = require("sf_toolkit/lib/api/sfApi");

export default class FirmHandler {
  commandNameSetFirm = "silverfin-development-toolkit.setFirm";
  commandNameAuthorizeFirm = "silverfin-development-toolkit.authorizeFirm";
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
    let firmIdStored = await firmCredentials.getDefaultFirmId();
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
    await firmCredentials.setDefaultFirmId(newFirmId);
    vscode.window.showInformationMessage(
      `Firm ID ${newFirmId} stored succesfully`
    );
    // Check firm id's credentials
    const firmTokens = firmCredentials.getTokenPair(newFirmId);
    if (!firmTokens) {
      vscode.window.showWarningMessage(
        "The firm ID provided is not authorized yet."
      );
      return;
    }
    // Refresh the Firm Panel (to update the Active label)
    vscode.commands.executeCommand("firm-panel.refresh");
    return true;
  }

  public async authorizeFirmCommand() {
    let firmIdStored;
    const checkExistingRepo = utils.setCWD();
    if (checkExistingRepo) {
      // Get Firm Stored
      firmIdStored = await firmCredentials.getDefaultFirmId();
    }
    // Request Firm ID
    const firmIdProvided = await vscode.window.showInputBox({
      prompt: "Firm ID to authorize",
      placeHolder: "123456",
      title: "AUTHORIZE SILVERFIN API",
      value: firmIdStored ? firmIdStored : "",
    });
    // Empty prompt
    if (!firmIdProvided) {
      return;
    }
    this.output.appendLine(`[Auth] firmIdProvided: ${firmIdProvided}`);

    // Open Browser to authorize
    const browserOpen = await this.openBrowserAuth(firmIdProvided);
    this.output.appendLine(`[Auth] browser opened? ${browserOpen}`);

    // Wait for the user to click the button
    const buttonClicked = await vscode.window.showInformationMessage(
      "Copy the authorization code of the firm in the browser and then press this button to enter authorization code provided by Silverfin",
      { modal: true },
      ...["Authorization Code"]
    );
    this.output.appendLine(`[Auth] button clicked? ${buttonClicked}`);

    // Request Authorization Code
    let authorizationCode;
    let tokenRequest;
    if (buttonClicked) {
      // Authorization Code
      authorizationCode = await vscode.window.showInputBox({
        prompt: "Enter the authorization code provided by Silverfin",
        placeHolder: "authorization code",
        title: "AUTHORIZE SILVERFIN API",
      });
      // Get Access Token
      if (authorizationCode) {
        tokenRequest = await sfApi.getAccessToken(
          firmIdProvided,
          authorizationCode
        );
      }
    }
    this.output.appendLine(
      `[Auth] token succesfull? ${tokenRequest ? true : false}`
    );

    // Failed to authorized
    if (!browserOpen || !buttonClicked || !tokenRequest) {
      vscode.window.showErrorMessage(
        `Firm ID ${firmIdProvided} not authorized. Please try again`
      );
      return;
    }
    //Success;
    vscode.window.showInformationMessage(
      `Firm ID ${firmIdProvided} authorized succesfully`
    );
    // Refresh the Firm Panel (to update the authorized list)
    vscode.commands.executeCommand("firm-panel.refresh");
    return true;
  }

  // Get Firm ID or set a new one via Prompt
  public async setFirmID() {
    utils.setCWD();
    let firmId: Number = firmCredentials.getDefaultFirmId();
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
      await firmCredentials.setDefaultFirmId(newFirmIdNumber);
      firmId = newFirmIdNumber;
    }
    return firmId;
  }

  public async checkFirmCredentials() {
    utils.setCWD();
    const firmIdStored = firmCredentials.getDefaultFirmId();
    const firmTokens = firmCredentials.getTokenPair(firmIdStored);
    if (!firmTokens) {
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

  private async openBrowserAuth(firmId: string) {
    const baseURL = process.env.SF_HOST || "https://live.getsilverfin.com";
    const redirectUri = "urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob";
    const scope =
      "user%3Aprofile+user%3Aemail+webhooks+administration%3Aread+administration%3Awrite+permanent_documents%3Aread+permanent_documents%3Awrite+communication%3Aread+communication%3Awrite+financials%3Aread+financials%3Awrite+financials%3Atransactions%3Aread+financials%3Atransactions%3Awrite+links+workflows%3Aread";
    const url = `${baseURL}/f/${firmId}/oauth/authorize?client_id=${process.env.SF_API_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    const browser = vscode.env.openExternal(vscode.Uri.parse(url));
    return browser;
  }
}
