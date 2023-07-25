// file referenced in esbuild.js (compiled as: output/webview.js)
// https://github.com/microsoft/vscode-webview-ui-toolkit/blob/main/docs/getting-started.md

import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeDataGrid,
  vsCodeDataGridCell,
  vsCodeDataGridRow,
  vsCodeLink,
  vsCodeTag,
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton());
provideVSCodeDesignSystem().register(vsCodeLink());
provideVSCodeDesignSystem().register(vsCodeTag());
provideVSCodeDesignSystem().register(vsCodeDataGrid());
provideVSCodeDesignSystem().register(vsCodeDataGridRow());
provideVSCodeDesignSystem().register(vsCodeDataGridCell());

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  openFileButton();
  authNewFirmButton();
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
