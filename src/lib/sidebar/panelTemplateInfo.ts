import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import * as types from "../types";
import * as panelUtils from "./panelUtils";

export class TemplateInformationViewProvider
  implements vscode.WebviewViewProvider
{
  public static readonly viewType = "template-info";
  public _view?: vscode.WebviewView;
  private templateType!: types.templateTypes | false;
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
    this.templateType = await templateUtils.getTemplateType();

    const configDataEntries = Object.entries(configData) || [];
    /* eslint-disable */
    const configItems: any = {
      reconciliationText: {
        handle: "Handle",
        name_en: "Name (en)",
        name_nl: "Name (nl)",
        name_fr: "Name (fr)",
        reconciliation_type: "Reconciliation type",
        virtual_account_number: "Virtual account number",
        is_active: "Active?",
        public: "Public?",
        externally_managed: "Externally managed?",
      },
      sharedPart: {
        name: "Name",
      },
      accountTemplate: {
        name_en: "Name (en)",
        name_nl: "Name (nl)",
        name_fr: "Name (fr)",
        account_range: "Account range",
        mapping_list_ranges: "Mapping list ranges",
      },
      exportFile: {
        name: "Name",
        file_name: "File name",
        encoding: "Encoding",
      },
    };

    /* eslint-enable */

    // Establish which type of template is being used
    let items: { [index: string]: any } = {};
    if (this.templateType) {
      items = configItems[this.templateType];
    }

    const filtered = configDataEntries.filter(([key, _]) =>
      Object.keys(items).includes(key)
    );

    const configItemsRows = filtered
      .map(([key, value]) => {
        return /*html*/ `<vscode-data-grid-row>
                  <vscode-data-grid-cell grid-column="1">
                    ${items[key]}
                  </vscode-data-grid-cell>
                  <vscode-data-grid-cell grid-column="2" class="vs-actions">
                    ${value ? value : ""}
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
