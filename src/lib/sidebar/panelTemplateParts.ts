import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import * as panelUtils from "./panelUtils";
const fsUtils = require("sf_toolkit/fs_utils");

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
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri)],
    };
    await this.setContent(webviewView);
  }

  // Section's html created based on the ActiveTextEditor
  public async setContent(webviewView: vscode.WebviewView) {
    utils.setCWD();
    const firmId = panelUtils.getFirmIdStored();
    const configData = await templateUtils.getTemplateConfigData();
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
                        <vscode-data-grid-cell grid-column="2"  class="vs-actions">
                          <vscode-button appearance="icon" aria-label="Open-file">
                            <span class="codicon codicon-go-to-file"></span>
                          </vscode-button>
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
                                      <vscode-data-grid-cell grid-column="2"  class="vs-actions">
                                        <vscode-button appearance="icon" aria-label="Open-file">
                                          <span class="codicon codicon-go-to-file"></span>
                                        </vscode-button>
                                      </vscode-data-grid-cell>
                                    </vscode-data-grid-row>`
      )
      .join("");

    const gridLayout = `grid-template-columns="3fr 1fr"`;
    let htmlBody = `<vscode-data-grid aria-label="template parts" ${gridLayout}>
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
                        <vscode-data-grid-cell grid-column="2"  class="vs-actions">
                          <vscode-button appearance="icon" aria-label="Open-file">
                            <span class="codicon codicon-go-to-file"></span>
                          </vscode-button>
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>
                      ${partsRows}
                    </vscode-data-grid>
                    <vscode-data-grid aria-label="template shared-parts" ${gridLayout}>
                      <vscode-data-grid-row row-type="header">
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
                          Shared parts
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="2">
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>
                      ${sharedPartsRows}
                    </vscode-data-grid>`;
    return panelUtils.htmlContainer(webviewView, this._extensionUri, htmlBody);
  }
}
