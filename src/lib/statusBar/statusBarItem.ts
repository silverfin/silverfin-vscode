import * as vscode from "vscode";

export default class StatusBarItem {
  item: vscode.StatusBarItem;
  constructor(context: vscode.ExtensionContext) {
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
    this.item.tooltip = "Silverfin is running your liquid test";
    this.item.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground"
    );
  }

  setStatic() {
    this.item.text = "$(sync) Liquid Test";
  }

  setSpin() {
    this.item.text = "$(sync~spin) Liquid Test";
  }
}
