import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import ExtensionContext from "../extensionContext";
import SilverfinToolkit from "../silverfinToolkit";
import * as panelUtils from "./panelUtils";

interface FirmsIds {
  [key: string]: string;
}

interface TemplateUsedInFirmData {
  templateFolder: string;
  firmId: string;
  templateId: string;
}

/**
 * Provider that handles the view for Firm details
 */
export default class FirmViewProvider implements vscode.WebviewViewProvider {
  private readonly viewType = "firm-info";
  private _view?: vscode.WebviewView;
  constructor(private readonly _extensionUri: vscode.Uri) {
    this._extensionUri = _extensionUri;
    this.registerEvents();
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    await this.setContent(webviewView);

    this.messageHandler(webviewView);
  }

  public async setContent(webviewView: vscode.WebviewView) {
    utils.setCWD();
    const configData = await templateUtils.getTemplateConfigData();
    const templateType = await templateUtils.getTemplateType();
    if (!templateType) {
      return;
    }
    const templateFolder = templateUtils.SILVERFIN_URL_PATHS[templateType];

    const createUsedInFirmsList = (
      object: FirmsIds,
      templateFolder: string
    ) => {
      return Object.keys(object).map((key) => {
        return {
          templateFolder: templateFolder,
          firmId: key,
          templateId: object[key]
        };
      });
    };

    const templateUsedInFirmsData = createUsedInFirmsList(
      configData["id"] || {},
      templateFolder
    );

    const firmId = await panelUtils.getFirmIdStored();
    await SilverfinToolkit.firmCredentials.loadCredentials(); // refresh credentials
    const firmData = await SilverfinToolkit.firmCredentials.listAuthorizedFirms(
      firmId
    ); // [[firmId, firmName]...]
    const usedInFirmsRows = templateUsedInFirmsData
      .map((item: TemplateUsedInFirmData) => {
        let templateUrl = `https://live.getsilverfin.com/f/${item.firmId}/${item.templateFolder}/${item.templateId}/edit`;
        return /*html*/ `<vscode-data-grid-row grid-columns="2">
                <vscode-data-grid-cell grid-column="1">
                  ${item.firmId}
                </vscode-data-grid-cell>
                <vscode-data-grid-cell grid-column="2" class="vs-actions">
                  <vscode-link href="${templateUrl}" title="Go to template's code (in Silverfin)">
                    <vscode-button appearance="icon" aria-label="Open-file">
                      <i class="codicon codicon-globe"></i>
                    </vscode-button>
                  </vscode-link>
                </vscode-data-grid-cell>
              </vscode-data-grid-row>`;
      })
      .join("");

    const authorizedFirmsRows = firmData
      .map((firm: string) => {
        let activeFirmTag =
          firm[0].toString() === firmId.toString()
            ? /*html*/ `<vscode-tag>Active</vscode-tag>`
            : "";
        let firmUrl = `https://live.getsilverfin.com/f/${firm[0]}`;
        return /*html*/ `<vscode-data-grid-row>
                  <vscode-data-grid-cell grid-column="1">
                      ${firm[0]} ${firm[1] ? `(${firm[1]})` : ""}
                  </vscode-data-grid-cell>
                  <vscode-data-grid-cell grid-column="2"  class="vs-actions">
                    ${activeFirmTag}                       
                    <vscode-link href="${firmUrl}" title="Go to firm (in Silverfin)">
                      <vscode-button appearance="icon" aria-label="Open-file">
                        <i class="codicon codicon-globe"></i>
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
          <vscode-button appearance="icon" aria-label="set-active-firm" class="set-active-firm" title="Set the active firm">
            <i class="codicon codicon-home"></i>
          </vscode-button>
          <vscode-button appearance="icon" aria-label="authorize-new-firm" class="auth-new-firm" title="Authorize a new firm">
            <i class="codicon codicon-add"></i>
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
        case "set-active-firm":
          // Run command to set the default/active firm
          vscode.commands.executeCommand(
            "silverfin-development-toolkit.setFirm"
          );
          return;
      }
    });
  }

  private registerEvents() {
    const extensionContext = ExtensionContext.get();
    extensionContext.subscriptions.push(
      vscode.window.registerWebviewViewProvider(this.viewType, this)
    );
    // command that can be used to force a refresh of the firms panel
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand("firm-panel.refresh", () => {
        if (!this._view) {
          return;
        }
        this.setContent(this._view);
      })
    );
    vscode.window.onDidChangeActiveTextEditor(() => {
      vscode.commands.executeCommand("firm-panel.refresh");
    });
    vscode.workspace.onDidSaveTextDocument(() => {
      vscode.commands.executeCommand("firm-panel.refresh");
    });
  }
}
