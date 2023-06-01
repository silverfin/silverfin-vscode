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
