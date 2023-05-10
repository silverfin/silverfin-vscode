import * as vscode from "vscode";
import * as utils from "../utils";
const fsUtils = require("sf_toolkit/fs_utils");
const { config } = require("sf_toolkit/api/auth");

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
    webviewView.webview.html = await this.getHtmlForWebview(
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

  private async getHtmlForWebview(webview: vscode.Webview) {
    const firmId = getFirmIdStored();
    const configData = await utils.getTemplateConfigData();

    const partNames = Object.keys(configData.text_parts) || [];
    const partsLi = partNames
      .map((partName) => `<li>${partName}</li>`)
      .join("");

    const sharedParts =
      (await fsUtils.getSharedParts(firmId, configData.handle)) || [];
    const sharedPartsLi = sharedParts
      .map((sharedPart: string) => `<li>${sharedPart}</li>`)
      .join("");

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource};">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Parts</title>
			</head>
			<body>
        <p><i>Parts</i></p>
				<ul>${partsLi}</ul>
        <p><i>Shared Parts</i></p>
        <ul>${sharedPartsLi}</ul>
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
    webviewView.webview.html = await this.getHtmlForWebview(
      webviewView.webview
    );
  }

  private async getHtmlForWebview(webview: vscode.Webview) {
    const firmId = getFirmIdStored();
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

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource};">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Information</title>
			</head>
			<body>
				<ul>${itemsLi}</ul>
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
