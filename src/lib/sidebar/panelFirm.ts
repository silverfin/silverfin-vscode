import * as vscode from "vscode";
import * as panelUtils from "./panelUtils";
const { config } = require("sf_toolkit/api/auth");

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
    const firmId = panelUtils.getFirmIdStored();
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

    const gridLayout = `grid-template-columns="3fr 1fr"`;
    let htmlBody = `<vscode-data-grid aria-label="authorized firms" ${gridLayout}>
                      <vscode-data-grid-row row-type="header">
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
                          Authorized firm IDs
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="2">
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>
                      ${authorizedFirmsRows}
                    </vscode-data-grid>`;
    let htmlContent = panelUtils.htmlContainer(
      webviewView,
      this._extensionUri,
      htmlBody
    );
    webviewView.webview.html = htmlContent;
  }
}
