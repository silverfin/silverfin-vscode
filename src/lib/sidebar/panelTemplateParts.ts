import * as vscode from "vscode";
import * as types from "../../lib/types";
import * as userActions from "../../lib/userActions";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import * as panelUtils from "./panelUtils";
const sfCliFsUtils = require("silverfin-cli/lib/utils/fsUtils");
const fs = require("fs");

export class TemplatePartsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "template-parts";
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
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri)],
    };
    await this.setContent(webviewView);

    this.messageHandler(webviewView);
  }

  // Section's html created based on the ActiveTextEditor
  public async setContent(webviewView: vscode.WebviewView) {
    utils.setCWD();
    this.templateType = await templateUtils.getTemplateType();
    const firmId = await panelUtils.getFirmIdStored();
    const configData = await templateUtils.getTemplateConfigData();
    let htmlContent = "";

    // Templates
    if (configData && "text_parts" in configData) {
      templateUtils.removeDeletedParts();
      htmlContent = await this.htmlPartsTemplates(
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
    webviewView.description = "Templates where this shared part is used";
    webviewView.title = "SHARED PART";
    const templates = configData.used_in || [];

    const sharedPartsRows = templates
      .sort()
      .map((template: types.sharedPartUsedIn) => {
        if (!template) {
          return;
        }

        const folderPath = templateUtils.FOLDERS[template.type];
        const templatePath = `/${folderPath}/${template.handle}/main.liquid`;
        const templateTypeName =
          templateUtils.TEMPLATE_TYPES_NAMES[template.type];

        return /*html*/ `<vscode-data-grid-row>
            <vscode-data-grid-cell grid-column="1">
              ${template.handle} (${templateTypeName})
            </vscode-data-grid-cell>
            <vscode-data-grid-cell grid-column="2"  class="vs-actions">
              ${
                fs.existsSync(`.${templatePath}`)
                  ? /*html*/ `<vscode-button appearance="icon" aria-label="Open-file" class="open-file" data-value=${templatePath}>
                      <i class="codicon codicon-go-to-file"></i>
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

  private async htmlPartsTemplates(
    firmId: any,
    configData: any,
    webviewView: vscode.WebviewView
  ) {
    webviewView.description = "Parts and shared parts used in this template";
    const titleToUse = await this.setTitle();
    webviewView.title = titleToUse;

    if (!this.templateType) {
      return panelUtils.htmlContainer(
        webviewView,
        this._extensionUri,
        "Template not identified"
      );
    }
    const templateFolder = templateUtils.FOLDERS[this.templateType];

    let partNames: string[] = [];
    const handle = templateUtils.getTemplateHandle();
    partNames = Object.keys(configData.text_parts) || [];
    const partsRows = partNames
      .map(
        (partName: string, index: number) => /*html*/ `<vscode-data-grid-row>
                        <vscode-data-grid-cell grid-column="1">
                        ${index + 1}. ${partName}
                        </vscode-data-grid-cell>
                        <vscode-data-grid-cell grid-column="2" class="vs-actions">
                          <vscode-button appearance="icon" aria-label="Open-file" class="open-file" data-value="/${templateFolder}/${handle}/text_parts/${partName}.liquid" title="Open file in a new tab">
                            <i class="codicon codicon-go-to-file"></i>
                          </vscode-button>
                        </vscode-data-grid-cell>
                      </vscode-data-grid-row>`
      )
      .join("");

    const sharedPartNames = await sfCliFsUtils.listSharedPartsUsedInTemplate(
      firmId,
      this.templateType,
      handle
    );

    const sharedPartsRows =
      sharedPartNames.length > 0
        ? sharedPartNames
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
                    <i class="codicon codicon-go-to-file"></i>
                  </vscode-button>`
                : ""
            }
          </vscode-data-grid-cell>
        </vscode-data-grid-row>`;
            })
            .join("")
        : /*html*/
          `<vscode-data-grid-cell grid-column="1">
            There are currently no shared parts linked to this template
          </vscode-data-grid-cell>`;

    const gridLayout = `grid-template-columns="3fr 1fr"`;

    const partsBlock =
      /*html*/
      `<vscode-data-grid aria-label="template parts and linked shared parts" ${gridLayout}>
        <vscode-data-grid-row row-type="sticky-header"  grid-columns="1">
          <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
            Parts
          </vscode-data-grid-cell>
          <vscode-data-grid-cell cell-type="columnheader" grid-column="2" class="vs-actions">
          <vscode-button appearance="icon" aria-label="create-new-part" class="create-new-part" title="Create a new part for this template">
            <i class="codicon codicon-add"></i>
          </vscode-button>
        </vscode-data-grid-cell>
        </vscode-data-grid-row>
        <vscode-data-grid-row>
          <vscode-data-grid-cell grid-column="1">
            main
          </vscode-data-grid-cell>
          <vscode-data-grid-cell grid-column="2"  class="vs-actions">
            <vscode-button appearance="icon" aria-label="Open-file" class="open-file" data-value="/${templateFolder}/${handle}/main.liquid" title="Open file in a new tab">
              <i class="codicon codicon-go-to-file"></i>
            </vscode-button>
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        ${partsRows}
      </vscode-data-grid>`;

    const sharedPartsBlock = /*html*/ `<vscode-data-grid aria-label="template shared-parts" ${gridLayout}>
        <vscode-data-grid-row row-type="sticky-header" grid-columns="1">
          <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
            Shared parts
          </vscode-data-grid-cell> 
          <vscode-data-grid-cell cell-type="columnheader" grid-column="2" class="vs-actions">
            <vscode-button appearance="icon" aria-label="add-shared-part" class="add-shared-part" title="Add a shared part">
              <i class="codicon codicon-add"></i>
            </vscode-button>
            <vscode-button appearance="icon" aria-label="remove-shared-part" class="remove-shared-part" title="Remove a shared part">
              <i class="codicon codicon-remove"></i>
            </vscode-button>
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        <vscode-data-grid-row row-type="header" grid-columns="1">
          <vscode-data-grid-cell grid-column="1">
            <i>( Linked to this template in firm: ${firmId} )</i>
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        ${sharedPartsRows}
      </vscode-data-grid>`;

    let htmlBody = /*html*/ `${partsBlock}${sharedPartsBlock}`;

    return panelUtils.htmlContainer(webviewView, this._extensionUri, htmlBody);
  }

  private async setTitle() {
    const templateTypeName = this.templateType
      ? templateUtils.TEMPLATE_TYPES_NAMES[this.templateType].toUpperCase()
      : "TEMPLATE";
    return templateTypeName;
  }

  private messageHandler(webviewView: vscode.WebviewView) {
    webviewView.webview.onDidReceiveMessage(async (message: any) => {
      const cwd = utils.setCWD();
      const firmId = await panelUtils.getFirmIdStored();
      switch (message.type) {
        case "open-file":
          const fileUri = vscode.Uri.parse(cwd + message.value);
          vscode.window.showTextDocument(fileUri, { preview: true });
          return;
        case "create-new-part":
          await templateUtils.createTemplatePartPrompt();
          this.refreshPanels();
          return;
        case "add-shared-part":
          await userActions.addSharedPartPrompt(firmId);
          this.refreshPanels();
          return;
        case "remove-shared-part":
          await userActions.removeSharedPartsPrompt(firmId);
          this.refreshPanels();
          return;
      }
    });
  }

  private refreshPanels() {
    setTimeout(() => {
      vscode.commands.executeCommand("template-parts-panel.refresh");
      vscode.commands.executeCommand("template-info-panel.refresh");
    }, 1000);
  }
}
