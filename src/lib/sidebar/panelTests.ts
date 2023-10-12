import * as vscode from "vscode";
import * as types from "../../lib/types";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import * as panelUtils from "./panelUtils";

export class TestsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "liquid-tests";
  public _view?: vscode.WebviewView;
  public devModeStatus: "active" | "inactive" = "inactive";
  public devModeOption: "liquid-tests" | "liquid-updates" = "liquid-tests";
  public testDetails!: types.TestRunDetails;
  private devModeLiquidInfo =
    "When you activate this option, updates to liquid files will be automatically pushed to Silverfin. This updates will be executed everytime a change to a file related to the template is saved. Keep in mind that, it will use the firm set as ACTIVE. Make sure you are using a development environment and monitor closely the updates made to Silverfin.";
  private devModeTestInfo =
    "When you activate this option, a new liquid test run will be initiated every time you save a file related to the template where it was enabeled. Keep in mind that, it will use the firm set as ACTIVE.";
  liquidTestRunner: any;
  statusBarItem: any;
  constructor(
    private readonly _extensionUri: vscode.Uri,
    liquidTestRunner: any,
    statusBarDevMode: any
  ) {
    this._extensionUri = _extensionUri;
    this.liquidTestRunner = liquidTestRunner;
    this.statusBarItem = statusBarDevMode;
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
    const templateHandle = templateUtils.getTemplateHandle();
    const templateType = await templateUtils.getTemplateType();
    const testNames = (await this.liquidTestRunner.listTestNames()) || [];
    const gridLayout = `grid-template-columns="2fr 1fr"`;
    const disabledLabel = this.clickableButtons() ? "" : "disabled";
    const disabledReverseLabel = this.clickableButtons() ? "disabled" : "";
    const liquidTestsRows = testNames.map((testName: string) => {
      return /*html*/ `<vscode-data-grid-row grid-columns="2">
              <vscode-data-grid-cell grid-column="1">
                ${testName}
              </vscode-data-grid-cell>
              <vscode-data-grid-cell grid-column="2" class="vs-actions">
                <vscode-button appearance="icon" aria-label="Run-test" class="run-test" title="Run liquid test" data-html-type="none" data-test-name="${testName}" data-template-type="${templateType}" data-template-handle="${templateHandle}" ${disabledLabel}>
                  <span class="codicon codicon-debug-alt"></span>
                </vscode-button>
                <vscode-button appearance="icon" aria-label="generate-html-input" class="run-test" title="Generate HTML (Input)" data-html-type="input" data-test-name="${testName}" data-template-type="${templateType}" data-template-handle="${templateHandle}" ${disabledLabel}>
                  <span class="codicon codicon-vm-outline"></span>
                </vscode-button>
                <vscode-button appearance="icon" aria-label="generate-html-output" class="run-test" title="Generate HTML (Preview)" data-html-type="preview" data-test-name="${testName}" data-template-type="${templateType}" data-template-handle="${templateHandle}" ${disabledLabel}>
                  <span class="codicon codicon-vm-running"></span>
                </vscode-button>
              </vscode-data-grid-cell>
            </vscode-data-grid-row>`;
    });

    const allTestsRow =
      /*html*/
      `<vscode-data-grid-row grid-columns="2">
            <vscode-data-grid-cell grid-column="1">
              All tests
            </vscode-data-grid-cell>
            <vscode-data-grid-cell grid-column="2" class="vs-actions">
              <vscode-button appearance="icon" aria-label="Run-all-test" class="run-test" title="Run all liquid test" data-html-type="none" data-test-name="" data-template-type="${templateType}" data-template-handle="${templateHandle}" ${disabledLabel}>
                <span class="codicon codicon-debug-alt"></span>
              </vscode-button>
              <vscode-button appearance="icon" aria-label="generate-html-input" disabled>
                <span class="codicon codicon-vm-outline"></span>
              </vscode-button>
              <vscode-button appearance="icon" aria-label="generate-html-output" disabled>
                <span class="codicon codicon-vm-running"></span>
              </vscode-button>
            </vscode-data-grid-cell>
          </vscode-data-grid-row>`;

    const liquidTestsBlock =
      liquidTestsRows.length > 0
        ? /*html*/
          `<vscode-data-grid-row row-type="sticky-header" grid-template-columns="1">
            <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
              Liquid tests (Scenarios)
            </vscode-data-grid-cell>
          </vscode-data-grid-row>
          ${liquidTestsRows.length > 1 ? allTestsRow : ""}
          ${liquidTestsRows.join("")}`
        : "";

    const testNameOptions = testNames.map((testName: string) => {
      const selected =
        this.testDetails?.testName === testName ? "selected" : "";
      return /*html*/ `<vscode-option value="${testName}" ${selected}>${testName}</vscode-option>`;
    });

    const htmlOptionValues = [
      ["none", "No view"],
      ["input", "Input (HTML"],
      ["preview", "Preview (HTML)"],
    ];
    const htmlOptions = htmlOptionValues.map((htmlType) => {
      const selected =
        this.testDetails?.htmlType === htmlType[0] ? "selected" : "";
      return /*html*/ `<vscode-option value="${htmlType[0]}" ${selected}>${htmlType[1]}</vscode-option>`;
    });

    const devTestSection =
      /* html */
      `<vscode-data-grid-row grid-columns="2">
          <vscode-data-grid-cell grid-column="1">
            <div class="dropdown-container">
              <vscode-dropdown id="test-selection" ${disabledLabel}>
                ${testNameOptions.join("")}
              </vscode-dropdown>
              <vscode-dropdown id="html-mode-selection" ${disabledLabel}>
                ${htmlOptions.join("")}
            </vscode-dropdown>
            </div>
          </vscode-data-grid-cell>
          <vscode-data-grid-cell grid-column="2" class="vs-actions">
            <vscode-button appearance="icon" class="dev-mode-tests" title="Activate" data-status="active" ${disabledLabel}>
              <span class="codicon codicon-circle-large"></span>
            </vscode-button>
            <vscode-button appearance="icon" class="dev-mode-tests" title="Deactivate" data-status="inactive" ${disabledReverseLabel}>
              <span class="codicon codicon-circle-slash"></span>
            </vscode-button>
          </vscode-data-grid-cell>
        </vscode-data-grid-row>`;

    const devTestBlock =
      /*html*/
      `<vscode-data-grid-row row-type="sticky-header" grid-template-columns="1">
          <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
            <span>
              Liquid tests
            </span>
          </vscode-data-grid-cell>
          <vscode-data-grid-cell cell-type="columnheader" grid-column="2" class="vs-actions">
            <vscode-button appearance="icon" title="${this.devModeTestInfo}">
              <span class="codicon codicon-info"></span>
            </vscode-button>
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        ${devTestSection}`;

    const devLiquidSection =
      /* html */
      `<vscode-data-grid-row grid-columns="2">
        <vscode-data-grid-cell grid-column="1">
          Push updates to Silverfin (on save)
        </vscode-data-grid-cell>
        <vscode-data-grid-cell grid-column="2" class="vs-actions">
          <vscode-button appearance="icon" class="dev-mode-liquid" title="Activate" data-status="active" ${disabledLabel}>
            <span class="codicon codicon-circle-large"></span>
          </vscode-button>
          <vscode-button appearance="icon" class="dev-mode-liquid" title="Deactivate" data-status="inactive" ${disabledReverseLabel}>
            <span class="codicon codicon-circle-slash"></span>
          </vscode-button>
        </vscode-data-grid-cell>
      </vscode-data-grid-row>`;

    const devLiquidBlock =
      /*html*/
      `<vscode-data-grid-row row-type="sticky-header" grid-template-columns="1">
        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
          <span>
            Liquid files
          </span>
        </vscode-data-grid-cell>
        <vscode-data-grid-cell cell-type="columnheader" grid-column="2" class="vs-actions">
          <vscode-button appearance="icon" title="${this.devModeLiquidInfo}">
            <span class="codicon codicon-info"></span>
          </vscode-button>
        </vscode-data-grid-cell>
      </vscode-data-grid-row>
      ${devLiquidSection}`;

    let htmlBody =
      /*html*/
      `<vscode-data-grid aria-label="liquid tests" ${gridLayout}>
        ${liquidTestsBlock}
        ${devTestBlock}
        ${devLiquidBlock}
      </vscode-data-grid>`;

    let htmlContent = panelUtils.htmlContainer(
      webviewView,
      this._extensionUri,
      htmlBody
    );
    webviewView.webview.html = htmlContent;
  }

  private messageHandler(webviewView: vscode.WebviewView) {
    webviewView.webview.onDidReceiveMessage(async (message: any) => {
      let previewOnly;
      switch (message.type) {
        case "run-test":
          previewOnly = message.htmlType === "none" ? false : true;
          this.liquidTestRunner.runTest(
            message.templateHandle,
            message.testName,
            previewOnly,
            message.htmlType
          );
          this.refreshPanel();
          return;
        case "dev-mode-liquid":
          this.devModeOption = "liquid-updates";
          this.devModeStatus = message.status;
          this.setBarStatus();
          this.refreshPanel();
          return;
        case "dev-mode-tests":
          this.devModeOption = "liquid-tests";
          this.devModeStatus = message.status;
          const templateHandle = templateUtils.getTemplateHandle() || "";
          previewOnly = message.htmlType === "none" ? false : true;
          this.testDetails = {
            templateHandle,
            testName: message.testName,
            previewOnly: previewOnly,
            htmlType: message.htmlType,
          };
          this.setBarStatus();
          this.refreshPanel();
          return;
      }
    });
  }

  private clickableButtons() {
    if (this.devModeStatus === "active") {
      return false;
    }
    return true;
  }

  private refreshPanel() {
    if (this._view) {
      this.setContent(this._view);
    }
  }

  private setBarStatus() {
    if (this.devModeStatus === "active") {
      this.statusBarItem.setStateRunning();
    } else {
      this.statusBarItem.setStateIdle();
    }
  }
}
