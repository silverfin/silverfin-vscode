import * as vscode from "vscode";
import AddClosingTag from "./lib/addClosingTag";
import DiagnosticCollectionsHandler from "./lib/diagnostics/diagnosticCollectionsHandler";
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
import TemplatePartsViewProvider from "./lib/sidebar/panelTemplateParts";
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
  DiagnosticCollectionsHandler.plug();

  const liquidTestHandler = new LiquidTestHandler();
  const templateUpdater = new TemplateUpdater();

  new LiquidLinter();
  new SharedPartsVerifier();
  new TemplateCommander();
  new AddClosingTag();
  new QuickFixesProviders();

  // Side-Bar Views
  new TemplatePartsViewProvider(context.extensionUri);
  new TemplateInformationViewProvider(context.extensionUri);
  new FirmViewProvider(context.extensionUri);
  const testsProvider = new TestsViewProvider(
    context.extensionUri,
    liquidTestHandler
  );

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
