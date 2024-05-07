// file referenced in esbuild.js (compiled as: output/webview.js)
// https://github.com/microsoft/vscode-webview-ui-toolkit/blob/main/docs/getting-started.md

import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeCheckbox,
  vsCodeDataGrid,
  vsCodeDataGridCell,
  vsCodeDataGridRow,
  vsCodeDropdown,
  vsCodeLink,
  vsCodeOption,
  vsCodeTag
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeLink(),
  vsCodeTag(),
  vsCodeDataGrid(),
  vsCodeDataGridRow(),
  vsCodeDataGridCell(),
  vsCodeCheckbox(),
  vsCodeDropdown(),
  vsCodeOption()
);

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);
function main() {
  openFileButton();
  authNewFirmButton();
  setDefaultFirmButton();
  runTestButton();
  devModeLiquidButton();
  devModeTestsButton();
  createNewPartButton();
  addSharedPartButton();
  removeSharedPartButton();
}

// Add event listener to all buttons with class "open-file"
// They should also have an attribute named "data-value" to identify the file to open
// <vscode-button class="open-file" data-value="shared_parts/name">
// <vscode-button class="open-file" data-value="reconciliation_texts/handle/part_name">
function openFileButton() {
  const buttons = document.getElementsByClassName("open-file");
  const buttonsArray = Array.from(buttons);
  buttonsArray.forEach((element) => {
    element?.addEventListener("click", () => {
      postMessageOpenFile(element.getAttribute("data-value"));
    });
  });
}

function postMessageOpenFile(dataValue: string | null) {
  vscode.postMessage({
    type: "open-file",
    value: dataValue
  });
}

// Add event listener to button with class "auth-new-firm"
// This should run the command to authenticate a new firm
function authNewFirmButton() {
  const buttons = document.getElementsByClassName("auth-new-firm");
  const buttonsArray = Array.from(buttons);
  buttonsArray.forEach((element) => {
    element?.addEventListener("click", () => {
      postMessageAuthNewFirm();
    });
  });
}

function postMessageAuthNewFirm() {
  vscode.postMessage({
    type: "auth-new-firm"
  });
}

// Add event listener to button with class "set-active-firm"
// This should run the command to set the default/active firm
function setDefaultFirmButton() {
  const buttons = document.getElementsByClassName("set-active-firm");
  const buttonsArray = Array.from(buttons);
  buttonsArray.forEach((element) => {
    element?.addEventListener("click", () => {
      postMessageSetDefaultFirm();
    });
  });
}

function postMessageSetDefaultFirm() {
  vscode.postMessage({
    type: "set-active-firm"
  });
}

// Add event listener to all buttons with class "run-test"
// They should also have an attribute named "data-html-type" to identify the type of HTML to generate
// They should also have an attribute named "data-test-name" to identify the test to run
// They should also have an attribute named "data-template-type" to identify the template type (reconciliationText or accountTemplate)
// They should also have an attribute named "data-template-handle" to identify the template handle
// <vscode-button class="run-test" data-html-type="input" data-test-name="test_name">
function runTestButton() {
  const buttons = document.getElementsByClassName("run-test");
  const buttonsArray = Array.from(buttons);
  buttonsArray.forEach((element) => {
    element?.addEventListener("click", () => {
      postMessageRunTest(
        element.getAttribute("data-template-type"),
        element.getAttribute("data-template-handle"),
        element.getAttribute("data-test-name"),
        element.getAttribute("data-html-type")
      );
    });
  });
}

function postMessageRunTest(
  dataTemplateType: string | null,
  dataTemplateHandle: string | null,
  dataTestName: string | null,
  dataHtmlType: string | null
) {
  vscode.postMessage({
    type: "run-test",
    templateType: dataTemplateType,
    templateHandle: dataTemplateHandle,
    testName: dataTestName,
    htmlType: dataHtmlType
  });
}

// Add event listener to button with class "dev-mode-liquid"
// This should run the command to toggle dev mode
function devModeLiquidButton() {
  const buttons = document.getElementsByClassName("dev-mode-liquid");
  const buttonsArray = Array.from(buttons);
  buttonsArray.forEach((element) => {
    element?.addEventListener("click", () => {
      postMessageDevModeLiquid(element.getAttribute("data-status"));
    });
  });
}

function postMessageDevModeLiquid(dataStatus: string | null) {
  vscode.postMessage({
    type: "dev-mode-liquid",
    status: dataStatus
  });
}

// Add event listener to button with class "dev-mode"
// This should run the command to toggle dev mode
function devModeTestsButton() {
  const buttons = document.getElementsByClassName("dev-mode-tests");
  const buttonsArray = Array.from(buttons);
  buttonsArray.forEach((element) => {
    element?.addEventListener("click", () => {
      const dataStatus = element.getAttribute("data-status");
      const testSelection = <HTMLInputElement>(
        document.getElementById("test-selection")
      );
      const htmlMode = <HTMLInputElement>(
        document.getElementById("html-mode-selection")
      );
      postMessageDevModeTests(
        dataStatus,
        testSelection?.value,
        htmlMode?.value
      );
    });
  });
}

function postMessageDevModeTests(
  dataStatus: string | null,
  dataTestSelection: string,
  dataHtmlMode: string
) {
  vscode.postMessage({
    type: "dev-mode-tests",
    status: dataStatus,
    testName: dataTestSelection,
    htmlType: dataHtmlMode
  });
}

// Add event listener to button with class "create-new-part"
function createNewPartButton() {
  const buttons = document.getElementsByClassName("create-new-part");
  const buttonsArray = Array.from(buttons);
  buttonsArray.forEach((element) => {
    element?.addEventListener("click", () => {
      postMessageCreateNewPart();
    });
  });
}

function postMessageCreateNewPart() {
  vscode.postMessage({
    type: "create-new-part"
  });
}

function addSharedPartButton() {
  const buttons = document.getElementsByClassName("add-shared-part");
  const buttonsArray = Array.from(buttons);
  buttonsArray.forEach((element) => {
    element?.addEventListener("click", () => {
      postMessageAddSharedPart();
    });
  });
}

function postMessageAddSharedPart() {
  vscode.postMessage({
    type: "add-shared-part"
  });
}

function removeSharedPartButton() {
  const buttons = document.getElementsByClassName("remove-shared-part");
  const buttonsArray = Array.from(buttons);
  buttonsArray.forEach((element) => {
    element?.addEventListener("click", () => {
      postMessageRemoveSharedPart();
    });
  });
}

function postMessageRemoveSharedPart() {
  vscode.postMessage({
    type: "remove-shared-part"
  });
}
