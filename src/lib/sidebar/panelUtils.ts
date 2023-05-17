import * as vscode from "vscode";
import { getNonce } from "../../utilities/getNonce";
import { getWebviewUri } from "../../utilities/getUri";
import * as utils from "../utils";
const { config } = require("sf_toolkit/api/auth");

export function getFirmIdStored() {
  utils.setCWD();
  const firmIdStored = config.getFirmId();
  if (firmIdStored) {
    return firmIdStored;
  }
  return false;
}

export function htmlHeader(webviewView: vscode.WebviewView, nonce: string) {
  return `<head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src ${webviewView.webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Information</title>
          </head>`;
}

export function htmlContainer(
  webviewView: vscode.WebviewView,
  extensionUri: vscode.Uri,
  htmlContent: string
) {
  const webviewUri = getWebviewUri(webviewView.webview, extensionUri, [
    "out",
    "webview.js",
  ]);
  const nonce = getNonce();
  return `<!DOCTYPE html>
                 <html lang="en">
                  ${htmlHeader(webviewView, nonce)}
                  <body>
                  ${htmlContent}
                  <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
                </body>
                </html>`;
}

// How to post messages ? (this can be done anywhere in the extension)
// vscode.postMessage({ type: 'identificationName', value: color });
//
// How Handle messages from the webview ?
// webviewView.webview.onDidReceiveMessage((data) => {
//   switch (data.type) {
//     case "identificationName": {
//       // do something with data.value
//       break;
//     }
//   }
// });
//
// <vscode-link href="command:extension.openTemplatePart?${partName}">
