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
  vsCodeTag,
  vsCodeTextField
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
  vsCodeOption(),
  vsCodeTextField()
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

  // Handle checkbox changes for boolean fields
  function setupCheckboxListeners() {
    const checkboxes = document.querySelectorAll("vscode-checkbox.config-checkbox");
    checkboxes.forEach((checkbox) => {
      // Remove existing listeners to avoid duplicates
      if ((checkbox as any).hasAttribute("data-listener-attached")) {
        return;
      }
      (checkbox as any).setAttribute("data-listener-attached", "true");

      checkbox.addEventListener("change", function (e) {
        const target = e.target as any;
        const fieldKey = target.getAttribute("data-field-key");
        const fieldLabel = target.getAttribute("data-field-label");
        const isChecked = target.checked;

        if (!fieldKey || !fieldLabel) {
          return;
        }

        // Add visual feedback
        target.classList.add("save-success");
        setTimeout(() => {
          target.classList.remove("save-success");
        }, 500);

        // Save the change
        postMessageSaveConfigField(fieldKey, isChecked, fieldLabel);
      });
    });
  }

  // Setup checkbox listeners on load
  setupCheckboxListeners();

  editableConfigFieldsClick();

  // Re-attach event listeners when DOM changes (e.g., after panel refresh)
  // Use a debounce to avoid excessive calls
  let timeoutId: NodeJS.Timeout | null = null;
  const observer = new MutationObserver((mutations) => {
    // Check if checkboxes or config-value elements were added/removed
    const hasCheckboxChanges = mutations.some(mutation =>
      Array.from(mutation.addedNodes).some(node =>
        node.nodeType === Node.ELEMENT_NODE &&
        ((node as Element).tagName === "VSCODE-CHECKBOX" ||
          (node as Element).querySelector?.("vscode-checkbox.config-checkbox"))
      )
    );

    const hasConfigChanges = mutations.some(mutation =>
      Array.from(mutation.addedNodes).some(node =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node as Element).querySelector?.(".config-value.editable-click")
      ) ||
      Array.from(mutation.removedNodes).some(node =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node as Element).querySelector?.(".config-value.editable-click")
      )
    );

    if (hasCheckboxChanges) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        setupCheckboxListeners();
      }, 100);
    }

    if (hasConfigChanges) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        editableConfigFieldsClick();
      }, 150);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
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
// <vscode-button class="run-test" data-html-type="input" data-test-name="test_name" data-template-handle="handle" data-template-type="reconciliationText">
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

function editableConfigFieldsClick() {
  const editableFields = document.querySelectorAll(".config-value.editable-click:not([data-listener-attached])");
  editableFields.forEach((field) => {
    const fieldElement = field as HTMLElement;
    // Mark as having listener attached to avoid duplicates
    fieldElement.setAttribute("data-listener-attached", "true");

    const fieldType = fieldElement.getAttribute("data-field-type");

    // Boolean fields are handled by checkbox listeners, skip them here
    if (fieldType !== "boolean") {
      // String and dropdown fields: show input on click
      fieldElement.addEventListener("click", function (e) {
        e.stopPropagation();
        const fieldKey = fieldElement.getAttribute("data-field-key");
        const fieldLabel = fieldElement.getAttribute("data-field-label");
        const currentValue = fieldElement.getAttribute("data-field-value");
        if (!fieldKey || !fieldLabel) {
          return;
        }

        // Find the corresponding input element
        const input = fieldElement.parentElement?.querySelector(`.config-input[data-field-key="${fieldKey}"]`) as HTMLElement;
        if (!input) {
          return;
        }

        // Hide the display value and show the input
        fieldElement.style.display = "none";
        input.classList.add("editing");

        // Focus the input
        if (input instanceof HTMLInputElement || input.tagName === "VSCODE-TEXT-FIELD") {
          setTimeout(() => {
            (input as any).focus();
            if (input instanceof HTMLInputElement) {
              input.select();
            }
          }, 10);
        } else if (input.tagName === "VSCODE-DROPDOWN") {
          setTimeout(() => {
            (input as any).focus();
          }, 10);
        }

        // Store original value for cancel
        input.setAttribute("data-original-value", currentValue || "");

        // Handle save on blur
        const handleBlur = () => {
          saveFieldValue(fieldKey, fieldLabel, fieldElement, input);
        };

        // Handle save on Enter (for text fields)
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Enter" && input.tagName === "VSCODE-TEXT-FIELD") {
            e.preventDefault();
            saveFieldValue(fieldKey, fieldLabel, fieldElement, input);
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancelFieldEdit(fieldElement, input);
          }
        };

        // Handle change for dropdowns
        const handleChange = () => {
          if (input.tagName === "VSCODE-DROPDOWN") {
            saveFieldValue(fieldKey, fieldLabel, fieldElement, input);
          }
        };

        // Remove old listeners if any
        input.removeEventListener("blur", handleBlur);
        input.removeEventListener("keydown", handleKeyDown);
        input.removeEventListener("change", handleChange);

        // Add new listeners
        input.addEventListener("blur", handleBlur);
        input.addEventListener("keydown", handleKeyDown);
        if (input.tagName === "VSCODE-DROPDOWN") {
          input.addEventListener("change", handleChange);
        }
      });
    }
  });
}

function saveFieldValue(
  fieldKey: string,
  fieldLabel: string,
  displayElement: HTMLElement,
  inputElement: HTMLElement
) {
  let newValue: string | boolean;

  if (inputElement.tagName === "VSCODE-TEXT-FIELD") {
    newValue = (inputElement as any).value || "";
  } else if (inputElement.tagName === "VSCODE-DROPDOWN") {
    newValue = (inputElement as any).value || "";
  } else {
    newValue = (inputElement as HTMLInputElement).value || "";
  }

  const originalValue = inputElement.getAttribute("data-original-value");

  // Only save if value changed
  if (String(newValue) !== String(originalValue)) {
    postMessageSaveConfigField(fieldKey, newValue, fieldLabel);
  } else {
    // Just hide input and show display
    inputElement.classList.remove("editing");
    displayElement.style.display = "";
  }
}

function cancelFieldEdit(displayElement: HTMLElement, inputElement: HTMLElement) {
  // Restore original value
  const originalValue = inputElement.getAttribute("data-original-value");
  if (inputElement.tagName === "VSCODE-TEXT-FIELD") {
    (inputElement as any).value = originalValue || "";
  } else if (inputElement.tagName === "VSCODE-DROPDOWN") {
    (inputElement as any).value = originalValue || "";
  } else {
    (inputElement as HTMLInputElement).value = originalValue || "";
  }

  // Hide input and show display
  inputElement.classList.remove("editing");
  displayElement.style.display = "";
}

function postMessageSaveConfigField(
  fieldKey: string | null,
  fieldValue: string | boolean,
  fieldLabel: string | null
) {
  vscode.postMessage({
    type: "save-config-field",
    fieldKey: fieldKey,
    fieldValue: fieldValue,
    fieldLabel: fieldLabel
  });
}
