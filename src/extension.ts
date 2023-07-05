import * as vscode from "vscode";
import FirmHandler from "./lib/firmHandler";
import LiquidLinter from "./lib/liquidLinter";
import LiquidTest from "./lib/liquidTest";
import LiquidTestQuickFixes from "./lib/quickFixes";
import { FirmViewProvider } from "./lib/sidebar/panelFirm";
import { TemplateInformationViewProvider } from "./lib/sidebar/panelTemplateInfo";
import { TemplatePartsViewProvider } from "./lib/sidebar/panelTemplateParts";
import StatusBarItem from "./lib/statusBarItem";
import * as utils from "./utilities/utils";

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

  // Quick Fixes Provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      "yaml",
      new LiquidTestQuickFixes(),
      {
        providedCodeActionKinds: LiquidTestQuickFixes.providedCodeActionKinds,
      }
    )
  );

  // Side-Bar Views
  // Template Parts
  const templatePartsProvider = new TemplatePartsViewProvider(
    context.extensionUri
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TemplatePartsViewProvider.viewType,
      templatePartsProvider
    )
  );
  vscode.window.onDidChangeActiveTextEditor(() => {
    if (!templatePartsProvider._view) {
      return;
    }
    templatePartsProvider.setContent(templatePartsProvider._view);
  });
  // Template Info
  const templateInfoProvider = new TemplateInformationViewProvider(
    context.extensionUri
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TemplateInformationViewProvider.viewType,
      templateInfoProvider
    )
  );
  vscode.window.onDidChangeActiveTextEditor(() => {
    if (!templateInfoProvider._view) {
      return;
    }
    templateInfoProvider.setContent(templateInfoProvider._view);
  });
  // Firm Info
  const firmInfoProvider = new FirmViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      FirmViewProvider.viewType,
      firmInfoProvider
    )
  );
  vscode.window.onDidChangeActiveTextEditor(() => {
    if (!firmInfoProvider._view) {
      return;
    }
    firmInfoProvider.setContent(firmInfoProvider._view);
  });
  // command that can be used to force a refresh of the firms panel
  // used when the user changes the firm id to refresh the Active label
  context.subscriptions.push(
    vscode.commands.registerCommand("firm-panel.refresh", () => {
      if (!firmInfoProvider._view) {
        return;
      }
      firmInfoProvider.setContent(firmInfoProvider._view);
    })
  );
}

export function deactivate() {}
