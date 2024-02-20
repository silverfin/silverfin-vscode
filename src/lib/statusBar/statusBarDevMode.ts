import * as vscode from "vscode";
import ExtensionContext from "../extensionContext";

/**
 * It will show the status of the development mode.
 * It will show a spinner when the development mode is running.
 * It will show an error message when the development mode fails.
 * It will hide when the development mode is idle.
 */
export default class StatusBarDevMode {
  private static uniqueInstance: StatusBarDevMode | null = null;
  public item: vscode.StatusBarItem;
  constructor() {
    const extensionContext = ExtensionContext.get();
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.item.hide();
    extensionContext.subscriptions.push(this.item);
  }

  public setStateIdle() {
    this.item.hide();
  }

  public setStateInternalError() {
    this.item.show();
    this.setStatic();
    this.item.tooltip = "Something went wrong";
    this.item.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.errorBackground"
    );
  }

  public setStateRunning() {
    this.item.show();
    this.setSpin();
    this.item.tooltip = "Silverfin's development mode is running!";
    this.item.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground"
    );
  }

  public setStatic() {
    this.item.text = "$(gear) Dev-Mode";
  }

  public setSpin() {
    this.item.text = `$(gear~spin) Dev-Mode`;
  }

  /**
   * @returns The unique instance of the UserLogger.
   * If it does not exist, it will create it.
   */
  public static plug(): StatusBarDevMode {
    if (!StatusBarDevMode.uniqueInstance) {
      StatusBarDevMode.uniqueInstance = new StatusBarDevMode();
    }
    return StatusBarDevMode.uniqueInstance;
  }
}
