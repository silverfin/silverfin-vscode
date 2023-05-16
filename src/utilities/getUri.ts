// https://github.com/microsoft/vscode-webview-ui-toolkit/blob/main/docs/getting-started.md

import { Uri, Webview } from "vscode";

export function getWebviewUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[]
) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}
