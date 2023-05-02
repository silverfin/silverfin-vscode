import * as vscode from "vscode";
import * as utils from "./utils";

export class TemplatePartsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "template-parts";
  private _view?: vscode.WebviewView;
  constructor(private readonly _extensionUri: vscode.Uri) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = await this._getHtmlForWebview(
      webviewView.webview
    );

    // How to post messages ? (this can be done anywhere in the extension)
    // vscode.postMessage({ type: 'identificationName', value: color });
    // How Handle messages from the webview ?
    // webviewView.webview.onDidReceiveMessage((data) => {
    //   switch (data.type) {
    //     case "identificationName": {
    //       // do something with data.value
    //       break;
    //     }
    //   }
    // });
  }

  private async _getHtmlForWebview(webview: vscode.Webview) {
    const configData = await utils.getTemplateConfigData();
    const partNames = Object.keys(configData.text_parts) || [];

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource};">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Parts</title>
			</head>
			<body>
      Template Parts
				<ul>
          <li>
            ${partNames}
          </il>
        </ul>
        Template Shared Parts
        <ul>
          <li>
          </li>
				</ul>
			</body>
			</html>`;
  }
}

export class TemplateInformationViewProvider
  implements vscode.WebviewViewProvider
{
  public static readonly viewType = "template-info";
  private _view?: vscode.WebviewView;
  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource};">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Parts</title>
			</head>
			<body>
				<ul>
          <li>
            Items in config.json
          </li>
				</ul>
			</body>
			</html>`;
  }
}
