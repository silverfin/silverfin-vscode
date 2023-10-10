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
  vsCodeTag,
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton());
provideVSCodeDesignSystem().register(vsCodeLink());
provideVSCodeDesignSystem().register(vsCodeTag());
provideVSCodeDesignSystem().register(vsCodeDataGrid());
provideVSCodeDesignSystem().register(vsCodeDataGridRow());
provideVSCodeDesignSystem().register(vsCodeDataGridCell());
provideVSCodeDesignSystem().register(vsCodeCheckbox());
provideVSCodeDesignSystem().register(vsCodeDropdown());

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  openFileButton();
  authNewFirmButton();
  setDefaultFirmButton();
  runTestButton();
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
    value: dataValue,
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
    type: "auth-new-firm",
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
    type: "set-active-firm",
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
    htmlType: dataHtmlType,
  });
}
