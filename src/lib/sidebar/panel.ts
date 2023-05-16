import * as vscode from "vscode";
import { getNonce } from "../../utilities/getNonce";
import { getWebviewUri } from "../../utilities/getUri";
import * as utils from "../utils";
const fsUtils = require("sf_toolkit/fs_utils");
const { config } = require("sf_toolkit/api/auth");

export class TemplatePartsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "template-parts";
  public _view?: vscode.WebviewView;
  constructor(private readonly _extensionUri: vscode.Uri) {
    this._extensionUri = _extensionUri;
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "out")],
    };
    await this.setContent(webviewView);
  }

  // Section's html created based on the ActiveTextEditor
  public async setContent(webviewView: vscode.WebviewView) {
    const firmId = getFirmIdStored();
    const configData = await utils.getTemplateConfigData();
    let htmlContent = "";

    // Reconciliations
    if (configData && "text_parts" in configData) {
      htmlContent = await this.htmlPartsReconciliations(
        firmId,
        configData,
        webviewView
      );
    }

    // Shared Parts
    // Should we show something for shared parts?

    // HTML
    webviewView.webview.html = htmlContent;
  }

  private async htmlPartsReconciliations(
    firmId: any,
    configData: any,
    webviewView: vscode.WebviewView
  ) {
    let partNames: string[] = [];
    partNames = Object.keys(configData.text_parts) || [];
    const partsLi = partNames
      .map((partName) => `<li>${partName}</li>`)
      .join("");

    let sharedParts: string[] = [];
    sharedParts =
      (await fsUtils.getSharedParts(firmId, configData.handle)) || [];
    const sharedPartsLi = sharedParts
      .map((sharedPart: string) => `<li>${sharedPart}</li>`)
      .join("");

    let htmlBody = `<p><i>Main</i></p>
                <p><i>Parts:</i></p>
                <ul>${partsLi}</ul>
                <p><i>Shared Parts:</i></p>
                <ul>${sharedPartsLi}</ul`;
    return htmlContainer(webviewView, this._extensionUri, htmlBody);
  }
}

export class TemplateInformationViewProvider
  implements vscode.WebviewViewProvider
{
  public static readonly viewType = "template-info";
  public _view?: vscode.WebviewView;
  constructor(private readonly _extensionUri: vscode.Uri) {
    this._extensionUri = _extensionUri;
  }

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
    await this.setContent(webviewView);
  }

  // Section's html created based on the ActiveTextEditor
  public async setContent(webviewView: vscode.WebviewView) {
    const configData = await utils.getTemplateConfigData();

    const configDataEntries = Object.entries(configData) || [];
    const ITEMS: any = {
      handle: "Handle",
      name_en: "Name (en)",
      name_nl: "Name (nl)",
      name_fr: "Name (fr)",
      reconciliation_type: "Reconciliation type",
      virtual_account_number: "Virtual account number",
      auto_hide_formula: "Auto hide formula",
      is_active: "Active?",
      public: "Public?",
      externally_managed: "Externally managed?",
    };
    const filtered = configDataEntries.filter(([key, value]) =>
      Object.keys(ITEMS).includes(key)
    );

    const itemsLi = filtered
      .map(([key, value]) => {
        return `<li>${ITEMS[key]}: ${value}</li>`;
      })
      .join("");

    let htmlBody = `<ul>${itemsLi}</ul>`;
    let htmlContent = htmlContainer(webviewView, this._extensionUri, htmlBody);
    webviewView.webview.html = htmlContent;
  }
}

export class FirmViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "firm-info";
  public _view?: vscode.WebviewView;
  constructor(private readonly _extensionUri: vscode.Uri) {
    this._extensionUri = _extensionUri;
  }

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
    await this.setContent(webviewView);
  }

  public async setContent(webviewView: vscode.WebviewView) {
    const firmId = getFirmIdStored();
    const firmData = config.storedIds(firmId);
    const authorizedFirmsLi = firmData
      .map(
        (firm: string) =>
          `<li><vscode-link href="https://live.getsilverfin.com/f/${firm}">${firm}</vscode-link></li>`
      )
      .join("");

    let htmlBody = `<p><i>Firm to be used:</i></p>
                    <ul><li>${firmId}</li></ul>
                    <p><i>Authorized firms:</i></p>
                    <ul>${authorizedFirmsLi}</ul>`;
    let htmlContent = htmlContainer(webviewView, this._extensionUri, htmlBody);
    webviewView.webview.html = htmlContent;
  }
}

// Helper functions

function getFirmIdStored() {
  utils.setCWD();
  const firmIdStored = config.getFirmId();
  if (firmIdStored) {
    return firmIdStored;
  }
  return false;
}

function htmlHeader(webviewView: vscode.WebviewView, nonce: string) {
  return `<head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src ${webviewView.webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Information</title>
          </head>`;
}

function htmlContainer(
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
