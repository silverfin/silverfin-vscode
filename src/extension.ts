import * as vscode from "vscode";
import FirmHandler from "./lib/firmHandler";
import LiquidLinter from "./lib/liquidLinter";
import LiquidTest from "./lib/liquidTest";
import StatusBarItem from "./lib/statusBarItem";
import * as utils from "./lib/utils";

export async function activate(context: vscode.ExtensionContext) {
  // Initializers
  const outputChannel = vscode.window.createOutputChannel("Silverfin");
  const firmHandler = new FirmHandler(outputChannel);
  const statusBarItemRunTests = new StatusBarItem(
    context,
    firmHandler.credentials
  );
  const liquidLinter = new LiquidLinter(outputChannel);
  const liquidTest = new LiquidTest(context, outputChannel);
  // References
  firmHandler.statusBarItem = statusBarItemRunTests;
  liquidTest.statusBarItem = statusBarItemRunTests;
  liquidTest.firmHandler = firmHandler;

  // Command to set Firm ID via prompt and store it
  context.subscriptions.push(
    vscode.commands.registerCommand(firmHandler.commandName, () => {
      firmHandler.setFirmIdCommand();
    })
  );

  // Command to run the liquid linter
  context.subscriptions.push(
    vscode.commands.registerCommand(liquidLinter.commandName, () => {
      liquidLinter.verifyLiquidCommand();
    })
  );
  // Liquid Linter Command is run when you save a liquid file
  vscode.workspace.onDidSaveTextDocument(() => {
    if (LiquidLinter.isLiquidFileCheck()) {
      liquidLinter.verifyLiquidCommand();
    }
  });

  // Load Errors stored for open file if any
  if (vscode.window.activeTextEditor) {
    utils.loadStoredDiagnostics(
      vscode.window.activeTextEditor.document,
      outputChannel,
      context,
      liquidTest.errorsCollection
    );
  }

  // When a new file is opened for the first time. Load the Diagnostic stored from previous runs
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(async (currentDocument) => {
      utils.loadStoredDiagnostics(
        currentDocument,
        outputChannel,
        context,
        liquidTest.errorsCollection
      );
    })
  );

  // Command to clean Diagnostic Collection of current file
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "silverfin-development-toolkit.clearCurrentDiagnosticCollection",
      () => {
        if (!vscode.window.activeTextEditor) {
          return;
        }
        liquidTest.errorsCollection.set(
          vscode.window.activeTextEditor.document.uri,
          []
        );
      }
    )
  );

  // Command to run all tests
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "silverfin-development-toolkit.runAllTests",
      () => {
        liquidTest.runAllTestsCommand();
      }
    )
  );

  // Command to run specific test
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "silverfin-development-toolkit.runTestWithOptions",
      () => {
        liquidTest.runTestWithOptionsCommand();
      }
    )
  );
}

export function deactivate() {}
