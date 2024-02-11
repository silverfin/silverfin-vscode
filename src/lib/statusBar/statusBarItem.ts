import * as vscode from "vscode";
import ExtensionContext from "../ExtensionContext";

/**
 * StatusBarItem class to handle the status bar item for the extension.
 * It will show the status of the liquid test.
 * It will show a spinner when the liquid test is running.
 * It will show an error message when the liquid test fails.
 * It will hide when the liquid test is idle.
 */
export default class StatusBarItem {
  private static uniqueInstance: StatusBarItem | null = null;
  item: vscode.StatusBarItem;
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
    this.item.tooltip = "Silverfin is running your liquid test";
    this.item.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground"
    );
  }

  public setStatic() {
    this.item.text = "$(sync) Liquid Test";
  }

  public setSpin() {
    this.item.text = "$(sync~spin) Liquid Test";
  }

  /**
   * @returns The unique instance of the UserLogger.
   * If it does not exist, it will create it.
   */
  public static plug(): StatusBarItem {
    if (!StatusBarItem.uniqueInstance) {
      StatusBarItem.uniqueInstance = new StatusBarItem();
    }
    return StatusBarItem.uniqueInstance;
  }
}
