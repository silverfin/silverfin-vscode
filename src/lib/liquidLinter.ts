import { posix } from "path";
import * as vscode from "vscode";
import * as utils from "./utils";
const sfApi = require("sf_toolkit/api/sf_api");
const { config } = require("sf_toolkit/api/auth");

export default class LiquidLinter {
  commandName = "silverfin-development-toolkit.liquidLinter";
  errorsCollection: vscode.DiagnosticCollection;
  constructor() {
    this.errorsCollection = vscode.languages.createDiagnosticCollection(
      `LiquidLinterCollection`
    );
  }

  public async verifyLiquidCommand() {
    const isLiquidFile = LiquidLinter.isLiquidFileCheck();
    if (!isLiquidFile) {
      return;
    }
    utils.setCWD();
    const firmId = await this.getFirmId();
    if (!firmId) {
      return;
    }
    const data = await this.runLinter(firmId);
    this.populateDiagnosticCollection(data);
  }

  private async runLinter(firmId: Number) {
    if (!vscode.window.activeTextEditor) {
      return false;
    }
    const currentTextDocument = vscode.window.activeTextEditor.document;
    const liquidCode = currentTextDocument.getText();
    const requestData = JSON.stringify({ code: liquidCode });
    const response = await sfApi.verifyLiquid(firmId, requestData);
    if (response || response.status === 200) {
      return response.data;
    }
  }

  public static isLiquidFileCheck() {
    if (!vscode.window.activeTextEditor) {
      return false;
    }
    const filePath = posix.resolve(
      vscode.window.activeTextEditor.document.uri.path
    );
    const pathParts = filePath.split(posix.sep);
    const fileName = pathParts[pathParts.length - 1];
    const fileType = fileName.split(".")[1];
    if (fileType !== "liquid") {
      //vscode.window.showErrorMessage(`Command can only be run on liquid files`);
      return false;
    }
    return true;
  }

  private async getFirmId() {
    // Stored firm id
    let firmId: Number = config.getFirmId();
    if (!firmId) {
      vscode.window.showErrorMessage(`There is no firm ID registered`);
      return false;
    }
    const firmCredentials = config.getTokens(firmId);
    if (!firmCredentials) {
      vscode.window.showErrorMessage(
        `Firm ID: ${firmId}. You first need to authorize your firm using the CLI`
      );
      // outputChannel.appendLine(
      //   `Firm ID: ${firmIdStored}. Pair of access/refresh tokens missing from config`
      // );
      return false;
    }
    return firmId;
  }

  private populateDiagnosticCollection(data: []) {
    if (!vscode.window.activeTextEditor) {
      return false;
    }
    const diagnostics: vscode.Diagnostic[] = [];
    data.forEach((error: any) => {
      let errorType: vscode.DiagnosticSeverity;
      switch (error.type) {
        case "error":
          errorType = vscode.DiagnosticSeverity.Error;
          break;
        case "warning":
          errorType = vscode.DiagnosticSeverity.Warning;
          break;
        default:
          errorType = vscode.DiagnosticSeverity.Information;
          break;
      }
      let diagnostic = new vscode.Diagnostic(
        new vscode.Range(
          new vscode.Position(error.row, 0),
          new vscode.Position(error.row, 100)
        ),
        error.text,
        errorType
      );
      diagnostics.push(diagnostic);
    });
    this.errorsCollection.set(
      vscode.window.activeTextEditor.document.uri,
      diagnostics
    );
  }
}
