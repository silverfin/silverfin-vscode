import * as vscode from "vscode";

export default class StatusBarDevMode {
  item: vscode.StatusBarItem;
  constructor(context: vscode.ExtensionContext, credentials: boolean) {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.item.hide();
    context.subscriptions.push(this.item);
  }

  setStateIdle() {
    this.item.hide();
  }

  setStateInternalError() {
    this.item.show();
    this.setStatic();
    this.item.tooltip = "Something went wrong";
    this.item.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.errorBackground"
    );
  }

  setStateRunning() {
    this.item.show();
    this.setSpin();
    this.item.tooltip = "Silverfin's development mode is running!";
    this.item.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground"
    );
  }

  setStatic() {
    this.item.text = "$(gear) Dev-Mode";
  }

  setSpin() {
    this.item.text = `$(gear~spin) Dev-Mode`;
  }
}
