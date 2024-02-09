import * as vscode from "vscode";
import insertAutoCloseTag from "./lib/autoCloseTag";
import LiquidDiagnostics from "./lib/diagnostics/liquidDiagnostics";
import FirmHandler from "./lib/firmHandler";
import LiquidLinter from "./lib/liquidLinter";
import LiquidTest from "./lib/liquidTest";
import LiquidQuickFixes from "./lib/quickFixes/liquidQuickFixes";
import LiquidTestQuickFixes from "./lib/quickFixes/liquidTestsQuickFixes";
import { FirmViewProvider } from "./lib/sidebar/panelFirm";
import { TemplateInformationViewProvider } from "./lib/sidebar/panelTemplateInfo";
import { TemplatePartsViewProvider } from "./lib/sidebar/panelTemplateParts";
import { TestsViewProvider } from "./lib/sidebar/panelTests";
import StatusBarDevMode from "./lib/statusBar/statusBarDevMode";
import StatusBarItem from "./lib/statusBar/statusBarItem";
import { TemplateCommander } from "./lib/templateCommander";
import { TemplateUpdater } from "./lib/templateUpdater";
import * as diagnosticsUtils from "./utilities/diagnosticsUtils";

export async function activate(context: vscode.ExtensionContext) {
  // Initializers
  const outputChannelLog = vscode.window.createOutputChannel(
    "Silverfin (Extension Logs)"
  );
  const outputChannelUser =
    vscode.window.createOutputChannel("Silverfin (Users)");
  const firmHandler = new FirmHandler(outputChannelLog);
  const statusBarItemRunTests = new StatusBarItem(
    context,
    firmHandler.apiSecretsPresent
  );
  const statusBarDevMode = new StatusBarDevMode(
    context,
    firmHandler.apiSecretsPresent
  );
  const liquidLinter = new LiquidLinter(outputChannelLog);
  const liquidTest = new LiquidTest(context, outputChannelLog);
  const liquidDiagnostics = new LiquidDiagnostics(context, outputChannelLog);
  const templateUpdater = new TemplateUpdater(
    firmHandler,
    outputChannelLog,
    outputChannelUser
  );

  // References
  firmHandler.statusBarItem = statusBarItemRunTests;
  liquidTest.statusBarItem = statusBarItemRunTests;
  liquidTest.firmHandler = firmHandler;
  liquidLinter.firmHandler = firmHandler;

  // Command to set active Firm ID via prompt and store it
  context.subscriptions.push(
    vscode.commands.registerCommand(firmHandler.commandNameSetFirm, () => {
      firmHandler.setFirmIdCommand();
    })
  );

  // Command to authorize a Firm via prompt and store it
  context.subscriptions.push(
    vscode.commands.registerCommand(
      firmHandler.commandNameAuthorizeFirm,
      () => {
        firmHandler.authorizeFirmCommand();
      }
    )
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
    diagnosticsUtils.loadStoredDiagnostics(
      vscode.window.activeTextEditor.document,
      outputChannelLog,
      context,
      liquidTest.errorsCollection
    );
  }

  // When a new file is opened for the first time. Load the Diagnostic stored from previous runs
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(async (currentDocument) => {
      diagnosticsUtils.loadStoredDiagnostics(
        currentDocument,
        outputChannelLog,
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

  // Command to run specific test (with html input)
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "silverfin-development-toolkit.runTestWithOptionsInputHtml",
      () => {
        liquidTest.runTestWithOptionsCommand("input");
      }
    )
  );

  // Command to run specific test (with html preview)
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "silverfin-development-toolkit.runTestWithOptionsPreviewHtml",
      () => {
        liquidTest.runTestWithOptionsCommand("preview");
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
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      "liquid",
      new LiquidQuickFixes(),
      {
        providedCodeActionKinds: LiquidQuickFixes.providedCodeActionKinds,
      }
    )
  );

  // Liquid Diagnostics
  // Check Shared Parts included in templates
  vscode.workspace.onDidSaveTextDocument(() => {
    liquidDiagnostics.verifySharedPartsUsed();
  });

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
  context.subscriptions.push(
    vscode.commands.registerCommand("template-parts-panel.refresh", () => {
      if (!templatePartsProvider._view) {
        return;
      }
      templatePartsProvider.setContent(templatePartsProvider._view);
    })
  );
  vscode.window.onDidChangeActiveTextEditor(() => {
    vscode.commands.executeCommand("template-parts-panel.refresh");
  });
  vscode.workspace.onDidSaveTextDocument(() => {
    vscode.commands.executeCommand("template-parts-panel.refresh");
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
  context.subscriptions.push(
    vscode.commands.registerCommand("template-info-panel.refresh", () => {
      if (!templateInfoProvider._view) {
        return;
      }
      templateInfoProvider.setContent(templateInfoProvider._view);
    })
  );
  vscode.window.onDidChangeActiveTextEditor(() => {
    vscode.commands.executeCommand("template-info-panel.refresh");
  });
  vscode.workspace.onDidSaveTextDocument(() => {
    vscode.commands.executeCommand("template-info-panel.refresh");
  });
  // Liquid Tests
  const testsProvider = new TestsViewProvider(
    context.extensionUri,
    liquidTest,
    statusBarDevMode
  );
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TestsViewProvider.viewType,
      testsProvider
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("tests-panel.refresh", () => {
      if (!testsProvider._view) {
        return;
      }
      testsProvider.setContent(testsProvider._view);
    })
  );
  vscode.window.onDidChangeActiveTextEditor(() => {
    vscode.commands.executeCommand("tests-panel.refresh");
  });
  vscode.workspace.onDidSaveTextDocument(() => {
    vscode.commands.executeCommand("tests-panel.refresh");
  });
  // Firm Info
  const firmInfoProvider = new FirmViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      FirmViewProvider.viewType,
      firmInfoProvider
    )
  );
  // command that can be used to force a refresh of the firms panel
  context.subscriptions.push(
    vscode.commands.registerCommand("firm-panel.refresh", () => {
      if (!firmInfoProvider._view) {
        return;
      }
      firmInfoProvider.setContent(firmInfoProvider._view);
    })
  );
  vscode.window.onDidChangeActiveTextEditor(() => {
    vscode.commands.executeCommand("firm-panel.refresh");
  });
  vscode.workspace.onDidSaveTextDocument(() => {
    vscode.commands.executeCommand("firm-panel.refresh");
  });

  // Auto Close Tags
  vscode.workspace.onDidChangeTextDocument((event) => {
    insertAutoCloseTag(event);
  });

  // Development Mode
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (testsProvider.devModeStatus !== "active") {
      return;
    }
    // const activeDocument = vscode.window.activeTextEditor?.document;
    // if (activeDocument !== document) {
    //   return;
    // }
    switch (testsProvider.devModeOption) {
      case "liquid-tests":
        liquidTest.runTest(
          testsProvider.testDetails.templateHandle,
          testsProvider.testDetails.testName,
          testsProvider.testDetails.previewOnly,
          testsProvider.testDetails.htmlType
        );
        break;
      case "liquid-updates":
        await templateUpdater.pushToSilverfin(document.uri.path);
        break;
    }
  });

  new TemplateCommander(
    firmHandler,
    outputChannelLog,
    outputChannelUser,
    context
  );
}

export function deactivate() {}
