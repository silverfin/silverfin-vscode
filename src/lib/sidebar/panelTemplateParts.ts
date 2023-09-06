import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import * as panelUtils from "./panelUtils";
const sfCliFsUtils = require("silverfin-cli/lib/utils/fsUtils");
const fs = require("fs");

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

    this.messageHandler(webviewView);
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
    } else if (configData && "used_in" in configData) {
      // Shared Parts
      htmlContent = await this.htmlSharedPartUsedIn(
        firmId,
        configData,
        webviewView
      );
    } else {
      htmlContent = `Select a template with a valid "config.json" file to see its information here`;
      webviewView.description = "";
      webviewView.title = "Template";
    }

    // HTML
    webviewView.webview.html = htmlContent;
  }

  private async htmlSharedPartUsedIn(
    firmId: any,
    configData: any,
    webviewView: vscode.WebviewView
  ) {
    webviewView.description = "Reconciliations where this shared part is used";
    webviewView.title = "SHARED PART";
    const reconciliationNames =
      configData.used_in.map((reconciliation: any) => reconciliation.handle) ||
      [];

    const sharedPartsRows = reconciliationNames
      .sort()
      .map((reconciliationName: string) => {
        if (!reconciliationName) {
          return;
        }

        const templatePath = `/reconciliation_texts/${reconciliationName}/main.liquid`;

        return /*html*/ `<vscode-data-grid-row>
            <vscode-data-grid-cell grid-column="1">
              ${reconciliationName}
            </vscode-data-grid-cell>
            <vscode-data-grid-cell grid-column="2"  class="vs-actions">
              ${
                fs.existsSync(`.${templatePath}`)
                  ? /*html*/ `<vscode-button appearance="icon" aria-label="Open-file" class="open-file" data-value=${templatePath}>
                      <span class="codicon codicon-go-to-file"></span>
                    </vscode-button>`
                  : ""
              }
            </vscode-data-grid-cell>
          </vscode-data-grid-row>`;
      })
      .join("");

    const gridLayout = `grid-template-columns="3fr 1fr"`;
    let htmlBody = /*html*/ `<vscode-data-grid aria-label="template shared-parts" ${gridLayout}>
                              ${sharedPartsRows}
                             </vscode-data-grid>`;
    return panelUtils.htmlContainer(webviewView, this._extensionUri, htmlBody);
  }

  private async htmlPartsReconciliations(
    firmId: any,
    configData: any,
    webviewView: vscode.WebviewView
  ) {
    webviewView.description =
      "Parts and shared parts used in this reconciliation";
    webviewView.title = "RECONCILIATION";
    let partNames: string[] = [];
    const handle = configData.handle;
    partNames = Object.keys(configData.text_parts) || [];
    const partsRows = partNames
      .map(
        (partName: string, index: number) => /*html*/ `<vscode-data-grid-row>
                        <vscode-data-grid-cell grid-column="1">
                        ${index + 1}. ${partName}
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell grid-column="2" class="vs-actions">
                          <vscode-button appearance="icon" aria-label="Open-file" class="open-file" data-value="/reconciliation_texts/${handle}/text_parts/${partName}.liquid" title="Open file in a new tab">
                            <span class="codicon codicon-go-to-file"></span>
                          </vscode-button>
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>`
      )
      .join("");

    const sharedPartNames = await sfCliFsUtils.listSharedPartsUsedInTemplate(
      firmId,
      "reconciliationText",
      handle
    );

    const sharedPartsRows = sharedPartNames
      .sort()
      .map((sharedPartName: string) => {
        const sharedPartPath = `/shared_parts/${sharedPartName}/${sharedPartName}.liquid`;

        return /*html*/ `<vscode-data-grid-row>
          <vscode-data-grid-cell grid-column="1">
            ${sharedPartName}
          </vscode-data-grid-cell>
          <vscode-data-grid-cell grid-column="2" class="vs-actions">
            ${
              fs.existsSync(`.${sharedPartPath}`)
                ? /*html*/ `<vscode-button appearance="icon" aria-label="Open-file" class="open-file" data-value=${sharedPartPath} title="Open file in a new tab">
                    <span class="codicon codicon-go-to-file"></span>
                  </vscode-button>`
                : ""
            }
          </vscode-data-grid-cell>
        </vscode-data-grid-row>`;
      })
      .join("");

    const gridLayout = `grid-template-columns="3fr 1fr"`;

    const partsBlock =
      /*html*/
      `<vscode-data-grid aria-label="template parts and linked shared parts" ${gridLayout}>
        <vscode-data-grid-row row-type="sticky-header"  grid-columns="1">
          <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
            Parts
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        <vscode-data-grid-row>
          <vscode-data-grid-cell grid-column="1">
            main
          </vscode-data-grid-cell>
          <vscode-data-grid-cell grid-column="2"  class="vs-actions">
            <vscode-button appearance="icon" aria-label="Open-file" class="open-file" data-value="/reconciliation_texts/${handle}/main.liquid" title="Open file in a new tab">
              <span class="codicon codicon-go-to-file"></span>
            </vscode-button>
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        ${partsRows}
      </vscode-data-grid>`;

    const sharedPartsBlock =
      sharedPartsRows.length > 0
        ? /*html*/ `<vscode-data-grid aria-label="template shared-parts" ${gridLayout}>
        <vscode-data-grid-row row-type="sticky-header" grid-columns="1">
          <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
            Shared parts
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        <vscode-data-grid-row row-type="header" grid-columns="1">
          <vscode-data-grid-cell grid-column="1">
            <i>( Linked to this reconciliation in firm: ${firmId} )</i>
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        ${sharedPartsRows}
      </vscode-data-grid>`
        : "";

    let htmlBody = /*html*/ `${partsBlock}${sharedPartsBlock}`;

    return panelUtils.htmlContainer(webviewView, this._extensionUri, htmlBody);
  }

  private messageHandler(webviewView: vscode.WebviewView) {
    webviewView.webview.onDidReceiveMessage((message: any) => {
      switch (message.type) {
        case "open-file":
          // Open file
          const cwd = utils.setCWD();
          const fileUri = vscode.Uri.parse(cwd + message.value);
          vscode.window.showTextDocument(fileUri, { preview: true });
          return;
      }
    });
  }
}
