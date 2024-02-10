import { posix } from "path";
import * as vscode from "vscode";
import * as utils from "../utilities/utils";
import ExtensionLogger from "./outputChannels/extensionLogger";
const sfCliApi = require("silverfin-cli/lib/api/sfApi");

/**
 * LiquidLinter class to handle the Liquid Linter functionality.
 * - Check if the file is a liquid file.
 * - Run the liquid linter.
 */
export default class LiquidLinter {
  context: vscode.ExtensionContext;
  commandName = "silverfin-development-toolkit.liquidLinter";
  errorsCollection: vscode.DiagnosticCollection;
  private extensionLogger: ExtensionLogger = ExtensionLogger.plug();
  firmHandler: any;
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.errorsCollection = vscode.languages.createDiagnosticCollection(
      `LiquidLinterCollection`
    );
    this.registerEvents();
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
      return false;
    }
    return true;
  }

  public async verifyLiquidCommand() {
    const isLiquidFile = LiquidLinter.isLiquidFileCheck();
    if (!isLiquidFile) {
      return;
    }
    utils.setCWD();
    const firmId = await this.firmHandler.getAuthorizedDefaultFirmId();
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
    const response = await sfCliApi.verifyLiquid(firmId, requestData);

    if (response || response.status === 200) {
      this.extensionLogger.log(`Run succesfully`, response.status);
      return response.data;
    } else {
      this.extensionLogger.log(`Run failed (${response.status})`, response);
      return false;
    }
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

  /**
   * Register the events to the Extension for the Liquid Linter.
   * 1) Command to run the liquid linter.
   * 2) Liquid Linter Command is run when you save a liquid file.
   */
  private registerEvents() {
    // Command to run the liquid linter
    this.context.subscriptions.push(
      vscode.commands.registerCommand(this.commandName, () => {
        this.verifyLiquidCommand();
      })
    );
    // Liquid Linter Command is run when you save a liquid file
    vscode.workspace.onDidSaveTextDocument(() => {
      if (LiquidLinter.isLiquidFileCheck()) {
        this.verifyLiquidCommand();
      }
    });
  }
}
