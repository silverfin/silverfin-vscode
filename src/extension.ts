import * as vscode from "vscode";
import AddClosingTag from "./lib/addClosingTag";
import DiagnosticLoader from "./lib/diagnostics/diagnosticsLoader";
import SharedPartsVerifier from "./lib/diagnostics/sharedPartsVerifier";
import ExtensionContext from "./lib/extensionContext";
import FirmHandler from "./lib/firmHandler";
import LiquidLinter from "./lib/liquidLinter";
import LiquidTestHandler from "./lib/liquidTestHandler";
import ExtensionLogger from "./lib/outputChannels/extensionLogger";
import UserLogger from "./lib/outputChannels/userLogger";
import QuickFixesProviders from "./lib/quickFixes/quickFixes";
import { FirmViewProvider } from "./lib/sidebar/panelFirm";
import { TemplateInformationViewProvider } from "./lib/sidebar/panelTemplateInfo";
import { TemplatePartsViewProvider } from "./lib/sidebar/panelTemplateParts";
import { TestsViewProvider } from "./lib/sidebar/panelTests";
import StatusBarDevMode from "./lib/statusBar/statusBarDevMode";
import StatusBarItem from "./lib/statusBar/statusBarItem";
import TemplateCommander from "./lib/templateCommander";
import TemplateUpdater from "./lib/templateUpdater";

export async function activate(context: vscode.ExtensionContext) {
  ExtensionContext.set(context);

  FirmHandler.plug();
  ExtensionLogger.plug();
  UserLogger.plug();
  StatusBarItem.plug();
  StatusBarDevMode.plug();

  const liquidTestHandler = new LiquidTestHandler();
  const templateUpdater = new TemplateUpdater();

  new DiagnosticLoader();
  new LiquidLinter();
  new SharedPartsVerifier();
  new TemplateCommander();
  new AddClosingTag();
  new QuickFixesProviders();

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
    liquidTestHandler
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

  // Development Mode
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    if (testsProvider.devModeStatus !== "active") {
      return;
    }
    switch (testsProvider.devModeOption) {
      case "liquid-tests":
        liquidTestHandler.runTest(
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
}

export function deactivate() {}
