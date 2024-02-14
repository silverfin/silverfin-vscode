import * as vscode from "vscode";
import { getNonce } from "../../utilities/getNonce";
import { getWebviewUri } from "../../utilities/getUri";
import * as utils from "../../utilities/utils";
import SilverfinToolkit from "../silverfinToolkit";

export async function getFirmIdStored() {
  utils.setCWD();
  await SilverfinToolkit.firmCredentials.loadCredentials(); // refresh credentials
  const firmIdStored =
    await SilverfinToolkit.firmCredentials.getDefaultFirmId();
  if (firmIdStored) {
    return firmIdStored;
  }
  return false;
}

export function htmlHeader(
  webviewView: vscode.WebviewView,
  extensionUri: vscode.Uri,
  nonce: string
) {
  // Custom CSS
  const styleUri = getWebviewUri(webviewView.webview, extensionUri, [
    "out",
    "style.css"
  ]);
  // https://microsoft.github.io/vscode-codicons/dist/codicon.html
  // https://github.com/microsoft/vscode-extension-samples/blob/main/webview-codicons-sample/src/extension.ts
  // https://github.com/microsoft/vscode-webview-ui-toolkit/blob/main/docs/components.md
  const codiconsUri = getWebviewUri(webviewView.webview, extensionUri, [
    "node_modules",
    "@vscode/codicons",
    "dist",
    "codicon.css"
  ]);
  const codiconsFontUri = getWebviewUri(webviewView.webview, extensionUri, [
    "node_modules",
    "@vscode/codicons",
    "dist",
    "codicon.ttf"
  ]);
  return `<head>
            <title>Information</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewView.webview.cspSource}; font-src ${webviewView.webview.cspSource} ${codiconsFontUri}; img-src ${webviewView.webview.cspSource} https:; script-src 'nonce-${nonce}';">
            <link href="${styleUri}" rel="stylesheet" type="text/css"/>
            <link href="${codiconsUri}" rel="stylesheet" type="text/css"/>
          </head>`;
}

export function htmlContainer(
  webviewView: vscode.WebviewView,
  extensionUri: vscode.Uri,
  htmlContent: string
) {
  const webviewUri = getWebviewUri(webviewView.webview, extensionUri, [
    "out",
    "webview.js"
  ]);
  const nonce = getNonce();
  return `<!DOCTYPE html>
                 <html lang="en">
                  ${htmlHeader(webviewView, extensionUri, nonce)}
                  <body>
                  ${htmlContent}
                  <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
                </body>
                </html>`;
}
