import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import * as panelUtils from "./panelUtils";

export class TestsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "liquid-tests";
  public _view?: vscode.WebviewView;
  liquidTestRunner: any;
  constructor(
    private readonly _extensionUri: vscode.Uri,
    liquidTestRunner: any
  ) {
    this._extensionUri = _extensionUri;
    this.liquidTestRunner = liquidTestRunner;
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

    const liquidTestsRows = testNames.map((testName: string) => {
      return /*html*/ `<vscode-data-grid-row grid-columns="2">
              <vscode-data-grid-cell grid-column="1">
                ${testName}
              </vscode-data-grid-cell>
              <vscode-data-grid-cell grid-column="2" class="vs-actions">
                <vscode-button appearance="icon" aria-label="Run-test" class="run-test" title="Run liquid test" data-html-type="none" data-test-name="${testName}" data-template-type="${templateType}" data-template-handle="${templateHandle}">
                  <span class="codicon codicon-debug-alt"></span>
                </vscode-button>
                <vscode-button appearance="icon" aria-label="generate-html-input" class="run-test" title="Generate HTML (Input)" data-html-type="input" data-test-name="${testName}" data-template-type="${templateType}" data-template-handle="${templateHandle}">
                  <span class="codicon codicon-vm-outline"></span>
                </vscode-button>
                <vscode-button appearance="icon" aria-label="generate-html-output" class="run-test" title="Generate HTML (Preview)" data-html-type="preview" data-test-name="${testName}" data-template-type="${templateType}" data-template-handle="${templateHandle}">
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
              <vscode-button appearance="icon" aria-label="Run-all-test" class="run-test" title="Run all liquid test" data-html-type="none" data-test-name="" data-template-type="${templateType}" data-template-handle="${templateHandle}">
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
            </vscode-data-grid-cell>
          </vscode-data-grid-row>
          ${liquidTestsRows.length > 1 ? allTestsRow : ""}
          ${liquidTestsRows.join("")}`
        : "";

    let htmlBody =
      /*html*/
      `<vscode-data-grid aria-label="liquid tests" ${gridLayout}>
        ${liquidTestsBlock}
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
        case "run-test":
          const previewOnly = message.htmlType === "none" ? false : true;
          this.liquidTestRunner.runTest(
            message.templateHandle,
            message.testName,
            previewOnly,
            message.htmlType
          );
          return;
      }
    });
  }
}
