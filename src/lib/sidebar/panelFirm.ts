import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import * as panelUtils from "./panelUtils";
const { firmCredentials } = require("silverfin-cli/lib/api/firmCredentials");

interface FirmsIds {
  [key: string]: string;
}

interface TemplateUsedInFirmData {
  templateType: string;
  firmId: string;
  templateId: string;
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

    this.messageHandler(webviewView);
  }

  public async setContent(webviewView: vscode.WebviewView) {
    utils.setCWD();
    const configData = await templateUtils.getTemplateConfigData();

    const createUsedInFirmsList = (object: FirmsIds, templateType: string) => {
      return Object.keys(object).map((key) => {
        return {
          templateType: templateType,
          firmId: key,
          templateId: object[key],
        };
      });
    };

    const templateType = configData.used_in
      ? "shared_parts"
      : "reconciliation_texts";
    const templateUsedInFirmsData = createUsedInFirmsList(
      configData["id"] || {},
      templateType
    );

    const firmId = await panelUtils.getFirmIdStored();
    await firmCredentials.loadCredentials(); // refresh credentials
    const firmData = await firmCredentials.listAuthorizedFirms(firmId); // [[firmId, firmName]...]
    const usedInFirmsRows = templateUsedInFirmsData
      .map((item: TemplateUsedInFirmData) => {
        let templateUrl = `https://live.getsilverfin.com/f/${item.firmId}/${item.templateType}/${item.templateId}/edit`;
        return /*html*/ `<vscode-data-grid-row grid-columns="2">
                <vscode-data-grid-cell grid-column="1">
                  ${item.firmId}
                </vscode-data-grid-cell>
                <vscode-data-grid-cell grid-column="2" class="vs-actions">
                  <vscode-link href="${templateUrl}" title="${templateUrl}">
                    <vscode-button appearance="icon" aria-label="Open-file">
                      <span class="codicon codicon-globe"></span>
                    </vscode-button>
                  </vscode-link>
                </vscode-data-grid-cell>
              </vscode-data-grid-row>`;
      })
      .join("");

    const authorizedFirmsRows = firmData
      .map((firm: string) => {
        let activeFirmTag = "";
        if (firm[0].toString() === firmId.toString()) {
          activeFirmTag = /*html*/ `<vscode-tag>Active</vscode-tag>`;
        }
        let firmUrl = `https://live.getsilverfin.com/f/${firm[0]}`;
        return /*html*/ `<vscode-data-grid-row>
                  <vscode-data-grid-cell grid-column="1">
                      ${firm[0]} ${firm[1] ? `(${firm[1]})` : ""}
                  </vscode-data-grid-cell>
                  <vscode-data-grid-cell grid-column="2"  class="vs-actions">
                    ${activeFirmTag}
                    <vscode-link href="${firmUrl}" title="${firmUrl}">
                      <vscode-button appearance="icon" aria-label="Open-file">
                        <span class="codicon codicon-globe"></span>
                      </vscode-button>
                    </vscode-link>
                  </vscode-data-grid-cell>
                </vscode-data-grid-row>`;
      })
      .join("");

    const gridLayout = `grid-template-columns="2fr 1fr"`;

    const usedInBlock =
      usedInFirmsRows.length > 0
        ? /*html*/
          `<vscode-data-grid-row row-type="sticky-header" grid-template-columns="1">
            <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
              Firms where this template is used in
            </vscode-data-grid-cell>
          </vscode-data-grid-row>
          ${usedInFirmsRows}`
        : "";

    const authorizedFirmsBlock =
      /*html*/
      `<vscode-data-grid-row row-type="sticky-header" grid-template-columns="1">
        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
          Authorized firms
        </vscode-data-grid-cell>
        <vscode-data-grid-cell cell-type="columnheader" grid-column="2" class="vs-actions">
          <vscode-button appearance="icon" aria-label="authorize-new-firm" class="auth-new-firm" title="Authorize a new firm">
            <span class="codicon codicon-add"></span>
          </vscode-button>
        </vscode-data-grid-cell>
      </vscode-data-grid-row>
      ${authorizedFirmsRows}`;

    let htmlBody =
      /*html*/
      `<vscode-data-grid aria-label="authorized firms" ${gridLayout}>
        ${usedInBlock}                    
        ${authorizedFirmsBlock}
      </vscode-data-grid>`;

    let htmlContent = panelUtils.htmlContainer(
      webviewView,
      this._extensionUri,
      htmlBody
    );
    webviewView.webview.html = htmlContent;
  }

  private messageHandler(webviewView: vscode.WebviewView) {
    webviewView.webview.onDidReceiveMessage((message: any) => {
      switch (message.type) {
        case "auth-new-firm":
          // Run command to authenticate a new firm
          vscode.commands.executeCommand(
            "silverfin-development-toolkit.authorizeFirm"
          );
          return;
      }
    });
  }
}
