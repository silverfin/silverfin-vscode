import * as vscode from "vscode";

export default class StatusBarItem {
  item: vscode.StatusBarItem;
  constructor(context: vscode.ExtensionContext, credentials: boolean) {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    if (credentials) {
      this.item.command = "silverfin-development-toolkit.runAllTests";
      this.item.text = "Silverfin: run liquid test";
    } else {
      this.item.text = "Silverfin: credentials missing";
    }
    this.item.show();
    context.subscriptions.push(this.item);

    this.registerOnDidChange();
  }

  private registerOnDidChange() {
    // Show/Hide statusBar (based on activeTab is YAML file)
    vscode.window.onDidChangeActiveTextEditor((e) => {
      const fileName = vscode.window.activeTextEditor?.document.fileName;
      if (!fileName) {
        return;
      }
      const fileNameParts = fileName.split(".");
      const fileType = fileNameParts[fileNameParts.length - 1].toLowerCase();
      if (fileType === "yaml" || fileType === "yml") {
        this.item.show();
      } else {
        this.item.hide();
      }
    });
  }

  setStateIdle() {
    this.item.text = "Silverfin: run liquid test";
    this.item.backgroundColor = "";
  }

  setStateInternalError() {
    this.item.text = "Silverfin: internal error";
    this.item.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.errorBackground"
    );
  }

  setStateRunning() {
    this.item.text = "Silverfin: running test...";
    this.item.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground"
    );
  }
}
