import * as vscode from "vscode";
import * as utils from "../utils";
const fsUtils = require("sf_toolkit/fs_utils");
const { config } = require("sf_toolkit/api/auth");

export class TemplatePartsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "template-parts";
  public _view?: vscode.WebviewView;
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
    await this.setContent(webviewView);
  }

  public async setContent(webviewView: vscode.WebviewView) {
    const firmId = getFirmIdStored();
    const configData = await utils.getTemplateConfigData();
    let htmlBody = "";

    // Reconciliations
    if (configData && "text_parts" in configData) {
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
      htmlBody = `<body>
                      <p><i>Parts:</i></p>
                      <ul>${partsLi}</ul>
                      <p><i>Shared Parts:</i></p>
                      <ul>${sharedPartsLi}</ul>
                    </body>`;
    }

    webviewView.webview.html = `<!DOCTYPE html>
			<html lang="en">
        ${htmlHeader(webviewView)}
        ${htmlBody}
			</html>`;
  }
}

export class TemplateInformationViewProvider
  implements vscode.WebviewViewProvider
{
  public static readonly viewType = "template-info";
  public _view?: vscode.WebviewView;
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
    await this.setContent(webviewView);
  }

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

    webviewView.webview.html = `<!DOCTYPE html>
			<html lang="en">
			${htmlHeader(webviewView)}
			<body>
				<ul>${itemsLi}</ul>
			</body>
			</html>`;
  }
}

export class FirmViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "firm-info";
  public _view?: vscode.WebviewView;
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
    await this.setContent(webviewView);
  }

  public async setContent(webviewView: vscode.WebviewView) {
    const firmId = getFirmIdStored();
    const firmData = config.storedIds(firmId);
    const authorizedFirmsLi = firmData
      .map((firm: string) => `<li>${firm}</li>`)
      .join("");

    webviewView.webview.html = `<!DOCTYPE html>
			<html lang="en">
      ${htmlHeader(webviewView)}
			<body>
        <p><i>Firm to be used:</i></p>
				<ul><li>${firmId}</li></ul>
        <p><i>Authorized firms:</i></p>
				<ul>${authorizedFirmsLi}</ul>
			</body>
			</html>`;
  }
}

function getFirmIdStored() {
  utils.setCWD();
  const firmIdStored = config.getFirmId();
  if (firmIdStored) {
    return firmIdStored;
  }
  return false;
}

function htmlHeader(webviewView: vscode.WebviewView) {
  return `<head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewView.webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Information</title>
          </head>`;
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
