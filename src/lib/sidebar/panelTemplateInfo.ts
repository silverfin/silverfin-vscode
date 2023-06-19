import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
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
    utils.setCWD();
    const configData = await templateUtils.getTemplateConfigData();

    const configDataEntries = Object.entries(configData) || [];
    /* eslint-disable */
    const reconciliationItems: any = {
      handle: "Handle",
      name_en: "Name (en)",
      name_nl: "Name (nl)",
      name_fr: "Name (fr)",
      reconciliation_type: "Reconciliation type",
      virtual_account_number: "Virtual account number",
      is_active: "Active?",
      public: "Public?",
      externally_managed: "Externally managed?",
    };

    const sharedPartItems: any = {
      name: "Name",
    };

    /* eslint-enable */
    let items: any;

    // Establish if we are using a shared part or a reconciliation
    if (configData.used_in) {
      items = sharedPartItems;
    } else {
      items = reconciliationItems;
    }

    const filtered = configDataEntries.filter(([key, value]) =>
      Object.keys(items).includes(key)
    );

    const configItemsRows = filtered
      .map(([key, value]) => {
        return /*html*/ `<vscode-data-grid-row>
                  <vscode-data-grid-cell grid-column="1">
                    ${items[key]}
                  </vscode-data-grid-cell>
                  <vscode-data-grid-cell grid-column="2" class="vs-actions">
                    ${value}
                  </vscode-data-grid-cell>
                </vscode-data-grid-row>`;
      })
      .join("");

    const gridLayout = `grid-template-columns="1fr 2fr"`;

    let htmlBody =
      configItemsRows.length > 0
        ? /*html*/ `<vscode-data-grid aria-label="template information" ${gridLayout}>
            <vscode-data-grid-row row-type="header">
              <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
              </vscode-data-grid-cell>
              <vscode-data-grid-cell cell-type="columnheader" grid-column="2">
              </vscode-data-grid-cell>
            </vscode-data-grid-row>
            ${configItemsRows}
          </vscode-data-grid>`
        : `Select a template with a valid "config.json" file to see its information here`;

    let htmlContent = panelUtils.htmlContainer(
      webviewView,
      this._extensionUri,
      htmlBody
    );
    webviewView.webview.html = htmlContent;
  }
}
