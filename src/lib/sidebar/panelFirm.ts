import * as vscode from "vscode";
import * as utils from "../../utilities/utils";
import * as templateUtils from "../../utilities/templateUtils";
import * as panelUtils from "./panelUtils";
const { config } = require("sf_toolkit/lib/api/auth");

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

    const firmId = panelUtils.getFirmIdStored();
    const firmData = config.storedIds(firmId);
    const usedInFirmsRows = templateUsedInFirmsData
      .map((item: TemplateUsedInFirmData) => {
        return `<vscode-data-grid-row grid-columns="2">
                <vscode-data-grid-cell grid-column="1">
                  ${item.firmId}
                </vscode-data-grid-cell>
                <vscode-data-grid-cell grid-column="2" class="vs-actions">
                  <vscode-link href="https://live.getsilverfin.com/f/${item.firmId}/${item.templateType}/${item.templateId}/edit">
                    ${item.templateId}
                  </vscode-link>
                </vscode-data-grid-cell>
              </vscode-data-grid-row>`;
      })
      .join("");

    const authorizedFirmsRows = firmData
      .map((firm: string) => {
        let activeFirmTag = "";
        if (firm.toString() === firmId.toString()) {
          activeFirmTag = `<vscode-tag>Active</vscode-tag>`;
        }
        return /*html*/ `<vscode-data-grid-row>
                  <vscode-data-grid-cell grid-column="1">
                    <vscode-link href="https://live.getsilverfin.com/f/${firm}">
                      ${firm}
                    </vscode-link>
                  </vscode-data-grid-cell>
                  <vscode-data-grid-cell grid-column="2"  class="vs-actions">
                    ${activeFirmTag}
                  </vscode-data-grid-cell>
                </vscode-data-grid-row>`;
      })
      .join("");

    const gridLayout = `grid-template-columns="3fr 1fr"`;
    let htmlBody = /*html*/ `${
      usedInFirmsRows.length > 0
        ? `<vscode-data-grid aria-label="authorized firms" ${gridLayout}>
        <vscode-data-grid-row row-type="sticky-header" grid-template-columns="1">
          <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
            Firms this template is used in
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        ${usedInFirmsRows}`
        : ""
    }
                              
        <vscode-data-grid-row row-type="sticky-header" grid-template-columns="1">
          <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
            Authorized firm IDs
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
