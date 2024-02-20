import * as vscode from "vscode";

/**
 * Singleton class to store the extension context.
 * This is used to access the extension context from anywhere in the extension.
 * This is useful for accessing the extension's resources, such as the global state.
 */
export default class ExtensionContext {
  private static uniqueInstance: vscode.ExtensionContext | null = null;

  static set(context: vscode.ExtensionContext) {
    ExtensionContext.uniqueInstance = context;
  }

  static get(): vscode.ExtensionContext {
    if (!ExtensionContext.uniqueInstance) {
      throw new Error("Extension context has not been set.");
    }
    return ExtensionContext.uniqueInstance;
  }
}
