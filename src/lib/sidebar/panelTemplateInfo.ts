import * as vscode from "vscode";
import * as utils from "../utils";
import * as panelUtils from "./panelUtils";

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

    const gridLayout = `grid-template-columns="1fr 2fr"`;
    let htmlBody = `<vscode-data-grid aria-label="template information" ${gridLayout}>
                      <vscode-data-grid-row row-type="header">
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell cell-type="columnheader" grid-column="2">
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>
                      ${configItemsRows}
                    </vscode-data-grid>`;
    let htmlContent = panelUtils.htmlContainer(
      webviewView,
      this._extensionUri,
      htmlBody
    );
    webviewView.webview.html = htmlContent;
  }
}
