import * as vscode from "vscode";
import * as utils from "../utilities/utils";
const { firmCredentials } = require("silverfin-cli/lib/api/firmCredentials");
const sfCliApiUtils = require("silverfin-cli/lib/utils/apiUtils");

export default class FirmHandler {
  commandNameSetFirm = "silverfin-development-toolkit.setFirm";
  commandNameAuthorizeFirm = "silverfin-development-toolkit.authorizeFirm";
  output: vscode.OutputChannel;
  apiSecretsPresent: boolean;
  statusBarItem: any;
  constructor(outputChannelLog: vscode.OutputChannel) {
    this.output = outputChannelLog;
    this.apiSecretsPresent = this.checkApiSecrets();
  }

  public async setFirmIdCommand() {
    // Set right path
    const check = utils.setCWD();
    if (!check) {
      return;
    }
    // Get Firm Stored
    await firmCredentials.loadCredentials(); // refresh credentials
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
    const firmTokens = await firmCredentials.getTokenPair(newFirmId);
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
    await firmCredentials.loadCredentials(); // refresh credentials
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
    this.output.appendLine(
      `[FirmHandler][Auth] firmIdProvided: ${firmIdProvided}`
    );

    // Open Browser to authorize
    const browserOpen = await this.openBrowserAuth(firmIdProvided);
    this.output.appendLine(
      `[FirmHandler][Auth] browser opened? ${browserOpen}`
    );

    // Wait for the user to click the button
    const buttonClicked = await vscode.window.showInformationMessage(
      "Copy the authorization code of the firm in the browser and then press this button to enter authorization code provided by Silverfin",
      { modal: true },
      ...["Authorization Code"]
    );
    this.output.appendLine(
      `[FirmHandler][Auth] button clicked? ${buttonClicked}`
    );

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
        tokenRequest = await sfCliApiUtils.getAccessToken(
          firmIdProvided,
          authorizationCode
        );
      }
    }
    this.output.appendLine(
      `[FirmHandler][Auth] token succesfull? ${tokenRequest ? true : false}`
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
    await firmCredentials.loadCredentials(); // refresh credentials
    let firmId: Number = await firmCredentials.getDefaultFirmId();
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
  public async getAuthorizedDefaultFirmId() {
    utils.setCWD();
    await firmCredentials.loadCredentials(); // refresh credentials
    let firmId: Number = await firmCredentials.getDefaultFirmId();
    if (!firmId) {
      vscode.window.showErrorMessage(
        `There is no firm ID registered as default. Please, set one first.`
      );
      this.output.appendLine(
        `[FirmHandler] No default firm stored for repository`
      );
      return false;
    }
    const authorizedFirm = await this.checkFirmCredentials(firmId);
    if (!authorizedFirm) {
      return false;
    }
    return firmId;
  }

  public async checkFirmCredentials(firmId: Number) {
    const firmTokens = await firmCredentials.getTokenPair(firmId);
    if (!firmTokens) {
      vscode.window.showErrorMessage(
        `Missing authorization for Firm ID ${firmId}. Please, authorize it first.`
      );
      this.output.appendLine(
        `[FirmHandler] Firm ID: ${firmId}. Pair of access/refresh tokens missing from config`
      );
      return false;
    }
    return true;
  }

  private checkApiSecrets() {
    // API Credentials
    const apiSecrets =
      process.env.SF_API_CLIENT_ID && process.env.SF_API_SECRET ? true : false;

    // Set Context Key
    // We can use this key in package.json menus.commandPalette to show/hide our commands
    vscode.commands.executeCommand(
      "setContext",
      "silverfin-development-toolkit.apiAuthorized",
      apiSecrets
    );

    this.output.appendLine(`[FirmHandler] API secrets: ${apiSecrets}`);
    return apiSecrets;
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
