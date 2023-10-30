import * as vscode from "vscode";
import * as types from "../../lib/types";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import * as panelUtils from "./panelUtils";
const { firmCredentials } = require("silverfin-cli/lib/api/firmCredentials");

export class TestsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "development";
  public _view?: vscode.WebviewView;
  public devModeStatus: "active" | "inactive" = "inactive";
  public lockedHandle!: string;
  public firmIdStored: string | undefined;
  public devModeOption: "liquid-tests" | "liquid-updates" = "liquid-tests";
  public testDetails!: types.TestRunDetails;
  private devModeLiquidInfo =
    "When you activate this option, updates to liquid files will automatically be pushed to Silverfin. These updates will be executed everytime a change to a file related to the template is saved. Keep in mind that, it will use the firm set as ACTIVE. Make sure you are using a development environment and closely monitor the updates made to Silverfin.";
  private devModeTestInfo =
    "When you activate this option, a new liquid test run will be initiated every time you save a file related to the template where it was enabled. Keep in mind that, it will use the firm set as ACTIVE.";
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
    this.firmIdStored = await firmCredentials.getDefaultFirmId();
    const liquidTestsRows = testNames.map((testName: string) => {
      return /*html*/ `
            <vscode-data-grid-row grid-columns="2">
              <vscode-data-grid-cell grid-column="1">
                ${testName}
              </vscode-data-grid-cell>
              <vscode-data-grid-cell grid-column="2" class="vs-actions">
                <vscode-button appearance="icon" aria-label="Run-test" class="run-test" title="Run liquid test" data-html-type="none" data-test-name="${testName}" data-template-type="${templateType}" data-template-handle="${templateHandle}" ${disabledLabel}>
                  <i class="codicon codicon-debug-alt"></i>
                </vscode-button>
                <vscode-button appearance="icon" aria-label="generate-html-input" class="run-test" title="Generate HTML (Input)" data-html-type="input" data-test-name="${testName}" data-template-type="${templateType}" data-template-handle="${templateHandle}" ${disabledLabel}>
                  <i class="codicon codicon-file-binary"></i>
                </vscode-button>
                <vscode-button appearance="icon" aria-label="generate-html-output" class="run-test" title="Generate HTML (Preview)" data-html-type="preview" data-test-name="${testName}" data-template-type="${templateType}" data-template-handle="${templateHandle}" ${disabledLabel}>
                  <i class="codicon codicon-file-pdf"></i>
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
                <i class="codicon codicon-debug-alt"></i>
              </vscode-button>
              <vscode-button appearance="icon" aria-label="generate-html-input" disabled>
                <i class="codicon codicon-file-binary"></i>
              </vscode-button>
              <vscode-button appearance="icon" aria-label="generate-html-output" disabled>
                <i class="codicon codicon-file-pdf"></i>
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

    // Show options of tests if not running, but hardcode to the current test if running across templates
    const createTestOption = (testName: string, selected: boolean) => {
      return /*html*/ `<vscode-option value="${testName}" ${
        selected ? "selected" : ""
      }>${testName}</vscode-option>`;
    };

    const testNameOptions = testNames.map((testName: string) => {
      const selected = this.testDetails?.testName === testName ? true : false;
      return createTestOption(testName, selected);
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

    const runningHandle = this.lockedHandle
      ? /*html*/
        `<vscode-data-grid-row>
          <vscode-data-grid-cell grid-column="1">
            Running for: ${this.lockedHandle}
          </vscode-data-grid-cell>
          <vscode-data-grid-cell grid-column="2">
          </vscode-data-grid-cell>
        </vscode-data-grid-row>`
      : "";

    const devTestSection =
      /* html */
      `${runningHandle}
      <vscode-data-grid-row>
        <vscode-data-grid-cell grid-column="1">
          <div class="dropdown-container">
            <vscode-dropdown class="dropdown-truncate" id="test-selection" ${disabledLabel}>
              ${
                this.testDetails?.testName
                  ? createTestOption(this.testDetails?.testName, true)
                  : testNameOptions.join("")
              }
            </vscode-dropdown>
          </div>
        </vscode-data-grid-cell>
      </vscode-data-grid-row>
      <vscode-data-grid-row>
        <vscode-data-grid-cell grid-column="1">
          <div class="dropdown-container">
            <vscode-dropdown id="html-mode-selection" ${disabledLabel}>
              ${htmlOptions.join("")}
            </vscode-dropdown>
          </div>
        </vscode-data-grid-cell>
        <vscode-data-grid-cell grid-column="2" class="vs-actions">
          <vscode-button appearance="icon" class="dev-mode-tests" title="Activate" data-status="active" ${disabledLabel}>
            <i class="codicon codicon-debug-start"></i>
          </vscode-button>
          <vscode-button appearance="icon" class="dev-mode-tests" title="Deactivate" data-status="inactive" ${
            !this.firmIdStored ? "disabled" : ""
          } ${disabledReverseLabel}>
            <i class="codicon codicon-stop-circle"></i>
          </vscode-button>
        </vscode-data-grid-cell>
      </vscode-data-grid-row>`;

    const devTestBlock =
      /*html*/
      `<vscode-data-grid-row row-type="sticky-header">
          <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
            <span>
              Development mode - local
            </span>
          </vscode-data-grid-cell>
          <vscode-data-grid-cell cell-type="columnheader" grid-column="2" class="vs-actions">
            <vscode-button appearance="icon" title="${this.devModeTestInfo}">
              <i class="codicon codicon-info"></i>
            </vscode-button>
          </vscode-data-grid-cell>
        </vscode-data-grid-row>
        ${devTestSection}`;

    const devLiquidSection =
      /* html */
      `<vscode-data-grid-row grid-columns="2">
        <vscode-data-grid-cell grid-column="1">
          ${
            this.firmIdStored
              ? `Push updates to Silverfin in firm ${this.firmIdStored}`
              : "You need to add a default firm before you can activate development mode to push automatically to Silverfin"
          } <i>(on save)</i>
        </vscode-data-grid-cell>
        <vscode-data-grid-cell grid-column="2" class="vs-actions">
          <vscode-button appearance="icon" class="dev-mode-liquid" title="Activate" data-status="active" ${disabledLabel}>
            <i class="codicon codicon-debug-start"></i>
          </vscode-button>
          <vscode-button appearance="icon" class="dev-mode-liquid" title="Deactivate" data-status="inactive" ${
            !this.firmIdStored ? "disabled" : ""
          } ${disabledReverseLabel}>
            <i class="codicon codicon-stop-circle"></i>
          </vscode-button>
        </vscode-data-grid-cell>
      </vscode-data-grid-row>`;

    const devLiquidBlock =
      /*html*/
      `<vscode-data-grid-row row-type="sticky-header">
        <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
          <span>
            Development mode - platform
          </span>
        </vscode-data-grid-cell>
        <vscode-data-grid-cell cell-type="columnheader" grid-column="2" class="vs-actions">
          <vscode-button appearance="icon" title="${this.devModeLiquidInfo}">
            <i class="codicon codicon-info"></i>
          </vscode-button>
        </vscode-data-grid-cell>
      </vscode-data-grid-row>
      ${devLiquidSection}`;

    let htmlBody =
      /*html*/
      `<vscode-data-grid aria-label="liquid tests" ${gridLayout}>
        ${
          this.firmIdStored && (this.lockedHandle || testNames.length > 0)
            ? devTestBlock
            : ""
        }
        ${devLiquidBlock}
        ${this.firmIdStored && testNames.length > 0 ? liquidTestsBlock : ""}
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
          this.lockedHandle = templateHandle;
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
    if (!this.firmIdStored || this.devModeStatus === "active") {
      return false;
    }
    this.lockedHandle = "";
    this.testDetails = {
      templateHandle: "",
      testName: "",
      previewOnly: false,
      htmlType: "none",
    };
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
