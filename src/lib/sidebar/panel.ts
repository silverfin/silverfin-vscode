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
    console.log(firmId);
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
    const partsRows = partNames
      .map(
        (partName) => `<vscode-data-grid-row>
                        <vscode-data-grid-cell grid-column="1">
                          ${partName}
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell grid-column="2">
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>`
      )
      .join("");

    let sharedParts: string[] = [];
    sharedParts =
      (await fsUtils.getSharedParts(firmId, configData.handle)) || [];
    const sharedPartsRows = sharedParts
      .map(
        (sharedPartName: string) => `<vscode-data-grid-row>
                                      <vscode-data-grid-cell grid-column="1">
                                        ${sharedPartName}
                                      </vscode-data-grid-cell>
                                      <vscode-data-grid-cell grid-column="2">
                                      </vscode-data-grid-cell>
                                    </vscode-data-grid-row>`
      )
      .join("");

    let htmlBody = `<vscode-data-grid aria-label="template parts">
                      <vscode-data-grid-row row-type="header">
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
                          Parts
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="2">
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>
                      <vscode-data-grid-row>
                        <vscode-data-grid-cell grid-column="1">
                          Main
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell grid-column="2">
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>
                      ${partsRows}
                    </vscode-data-grid>
                    <vscode-data-grid aria-label="template shared-parts">
                      <vscode-data-grid-row row-type="header">
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
                          Shared parts
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="2">
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>
                      ${sharedPartsRows}
                    </vscode-data-grid>`;
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
    /* eslint-disable */
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
    /* eslint-enable */
    const filtered = configDataEntries.filter(([key, value]) =>
      Object.keys(ITEMS).includes(key)
    );

    const configItemsRows = filtered
      .map(([key, value]) => {
        return `<vscode-data-grid-row>
                  <vscode-data-grid-cell grid-column="1">
                    ${ITEMS[key]}
                  </vscode-data-grid-cell>
                  <vscode-data-grid-cell grid-column="2">
                    ${value}
                  </vscode-data-grid-cell>
                </vscode-data-grid-row>`;
      })
      .join("");

    let htmlBody = `<vscode-data-grid aria-label="authorized firms">
                      <vscode-data-grid-row row-type="header">
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="2">
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>
                      ${configItemsRows}
                    </vscode-data-grid>`;
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
    const authorizedFirmsRows = firmData
      .map((firm: string) => {
        let activeFirmTag = "";
        if (firm.toString() === firmId.toString()) {
          activeFirmTag = `<vscode-tag>Active</vscode-tag>`;
        }
        return `<vscode-data-grid-row>
                  <vscode-data-grid-cell grid-column="1">
                    <vscode-link href="https://live.getsilverfin.com/f/${firm}">
                      ${firm}
                    </vscode-link>
                  </vscode-data-grid-cell>
                  <vscode-data-grid-cell grid-column="2">
                    ${activeFirmTag}
                  </vscode-data-grid-cell>
                </vscode-data-grid-row>`;
      })
      .join("");

    let htmlBody = `<vscode-data-grid aria-label="authorized firms">
                      <vscode-data-grid-row row-type="header">
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
                          Authorized firm IDs
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="2">
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>
                      ${authorizedFirmsRows}
                    </vscode-data-grid>`;
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
//
// <vscode-link href="command:extension.openTemplatePart?${partName}">
