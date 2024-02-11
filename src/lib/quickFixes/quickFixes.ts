import * as vscode from "vscode";
import ExtensionContext from "../ExtensionContext";
import LiquidQuickFixes from "./liquidQuickFixes";
import LiquidTestQuickFixes from "./liquidTestsQuickFixes";

/**
 * QuickFixesProviders
 * This class is responsible for registering the different QuickFixes Providers
 * for the Liquid and Liquid Test languages
 */
export default class QuickFixesProviders {
  constructor() {
    const extensionContext = ExtensionContext.get();
    extensionContext.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        "yaml",
        new LiquidTestQuickFixes(),
        {
          providedCodeActionKinds: LiquidTestQuickFixes.providedCodeActionKinds
        }
      )
    );
    extensionContext.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(
        "liquid",
        new LiquidQuickFixes(),
        {
          providedCodeActionKinds: LiquidQuickFixes.providedCodeActionKinds
        }
      )
    );
  }
}
