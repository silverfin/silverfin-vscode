import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
import ExtensionContext from "../extensionContext";
import * as types from "../types";
import * as panelUtils from "./panelUtils";

/**
 * Field type definitions
 */
type FieldType = "string" | "boolean" | "reconciliation_type" | "number";

/**
 * Configuration for a single config field
 */
interface FieldConfig {
  /** Display label for the field */
  label: string;
  /** Whether this field is editable */
  editable: boolean;
  /** Type of input to use for editing */
  type: FieldType;
  /** Options for dropdown fields (only used for reconciliation_type) */
  options?: Array<{ value: string; label: string }>;
}

/**
 * Configuration map for all config fields by template type
 */
type FieldConfigMap = {
  [templateType: string]: {
    [fieldKey: string]: FieldConfig;
  };
};

/**
 * Provider that handles the view for Template Information
 */
export default class TemplateInformationViewProvider
  implements vscode.WebviewViewProvider
{
  private readonly viewType = "template-info";
  private _view?: vscode.WebviewView;
  private templateType!: types.templateTypes | false;

  /**
   * Centralized configuration for all config fields
   * Define which fields are editable and their types here
   */
  private readonly fieldConfigs: FieldConfigMap = {
    reconciliationText: {
      handle: { label: "Handle", editable: false, type: "string" },
      name_en: { label: "Name (en)", editable: true, type: "string" },
      name_nl: { label: "Name (nl)", editable: true, type: "string" },
      name_fr: { label: "Name (fr)", editable: true, type: "string" },
      name_de: { label: "Name (de)", editable: true, type: "string" },
      name_da: { label: "Name (da)", editable: true, type: "string" },
      name_se: { label: "Name (se)", editable: true, type: "string" },
      name_fi: { label: "Name (fi)", editable: true, type: "string" },
      description_en: { label: "Description (en)", editable: true, type: "string" },
      description_nl: { label: "Description (nl)", editable: true, type: "string" },
      description_fr: { label: "Description (fr)", editable: true, type: "string" },
      description_de: { label: "Description (de)", editable: true, type: "string" },
      description_da: { label: "Description (da)", editable: true, type: "string" },
      description_se: { label: "Description (se)", editable: true, type: "string" },
      description_fi: { label: "Description (fi)", editable: true, type: "string" },
      reconciliation_type: {
        label: "Reconciliation type",
        editable: true,
        type: "reconciliation_type",
        options: [
          { value: "can_be_reconciled_without_data", label: "Can be reconciled without data" },
          { value: "reconciliation_not_necessary", label: "Reconciliation not necessary" },
          { value: "only_reconciled_with_data", label: "Only reconciled with data" }
        ]
      },
      virtual_account_number: { label: "Virtual account number", editable: true, type: "string" },
      is_active: { label: "Active?", editable: true, type: "boolean" },
      public: { label: "Public?", editable: true, type: "boolean" },
      externally_managed: { label: "Externally managed?", editable: false, type: "boolean" },
      auto_hide_formula: { label: "Auto hide formula", editable: true, type: "string" },
      allow_duplicate_reconciliations: { label: "Allow duplicate reconciliations?", editable: true, type: "boolean" },
      published: { label: "Published?", editable: true, type: "boolean" },
      hide_code: { label: "Hide code?", editable: true, type: "boolean" },
      use_full_width: { label: "Use full width?", editable: true, type: "boolean" },
      downloadable_as_docx: { label: "Downloadable as docx?", editable: true, type: "boolean" },
      test_firm_id: { label: "Test firm ID", editable: true, type: "number" }
    },
    sharedPart: {
      name: { label: "Name", editable: false, type: "string" }
    },
    accountTemplate: {
      name_en: { label: "Name (en)", editable: true, type: "string" },
      name_nl: { label: "Name (nl)", editable: false, type: "string" },
      name_fr: { label: "Name (fr)", editable: true, type: "string" },
      name_de: { label: "Name (de)", editable: true, type: "string" },
      name_da: { label: "Name (da)", editable: true, type: "string" },
      name_se: { label: "Name (se)", editable: true, type: "string" },
      name_fi: { label: "Name (fi)", editable: true, type: "string" },
      description_en: { label: "Description (en)", editable: true, type: "string" },
      description_nl: { label: "Description (nl)", editable: true, type: "string" },
      description_fr: { label: "Description (fr)", editable: true, type: "string" },
      description_de: { label: "Description (de)", editable: true, type: "string" },
      description_da: { label: "Description (da)", editable: true, type: "string" },
      description_se: { label: "Description (se)", editable: true, type: "string" },
      description_fi: { label: "Description (fi)", editable: true, type: "string" },
      account_range: { label: "Account range", editable: true, type: "string" },
      mapping_list_ranges: { label: "Mapping list ranges", editable: true, type: "string" },
      externally_managed: { label: "Externally managed?", editable: false, type: "boolean" },
      published: { label: "Published?", editable: true, type: "boolean" },
      hide_code: { label: "Hide code?", editable: true, type: "boolean" },
      test_firm_id: { label: "Test firm ID", editable: true, type: "number" }
    },
    exportFile: {
      name_en: { label: "Name (en)", editable: true, type: "string" },
      name_nl: { label: "Name (nl)", editable: false, type: "string" },
      name_fr: { label: "Name (fr)", editable: true, type: "string" },
      name_de: { label: "Name (de)", editable: true, type: "string" },
      name_da: { label: "Name (da)", editable: true, type: "string" },
      name_se: { label: "Name (se)", editable: true, type: "string" },
      name_fi: { label: "Name (fi)", editable: true, type: "string" },
      description_en: { label: "Description (en)", editable: true, type: "string" },
      description_nl: { label: "Description (nl)", editable: true, type: "string" },
      description_fr: { label: "Description (fr)", editable: true, type: "string" },
      description_de: { label: "Description (de)", editable: true, type: "string" },
      description_da: { label: "Description (da)", editable: true, type: "string" },
      description_se: { label: "Description (se)", editable: true, type: "string" },
      description_fi: { label: "Description (fi)", editable: true, type: "string" },
      file_name: { label: "File name", editable: true, type: "string" },
      externally_managed: { label: "Externally managed?", editable: false, type: "boolean" },
      encoding: { label: "Encoding", editable: true, type: "string" },
      published: { label: "Published?", editable: true, type: "boolean" },
      hide_code: { label: "Hide code?", editable: true, type: "boolean" },
      download_warning: { label: "Download warning", editable: true, type: "string" },
      test_firm_id: { label: "Test firm ID", editable: true, type: "number" }
    }
  };

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
  }

  // Section's html created based on the ActiveTextEditor
  public async setContent(webviewView: vscode.WebviewView) {
    utils.setCWD();
    const configData = await templateUtils.getTemplateConfigData();
    this.templateType = await templateUtils.getTemplateType();

    const configDataEntries = Object.entries(configData) || [];

    // Get field configurations for current template type
    const fieldConfigs = this.templateType ? this.fieldConfigs[this.templateType] || {} : {};

    // Filter to only show fields that have a configuration
    const filtered = configDataEntries.filter(([key, _]) =>
      Object.keys(fieldConfigs).includes(key)
    );

    const configItemsRows = filtered
      .map(([key, value]) => {
        const displayValue = value ? value : "";
        const fieldConfig = fieldConfigs[key];
        if (!fieldConfig) {
          return ""; // Skip fields without configuration
        }

        const isEditable = fieldConfig.editable;
        const fieldType = fieldConfig.type;

        // Format display value for different types
        let formattedDisplayValue = displayValue;
        let actualValue = value;
        if (fieldType === "boolean") {
          // Handle boolean values - could be true, false, "true", "false", or empty
          const boolValue = value === true || value === "true";
          actualValue = boolValue;
          formattedDisplayValue = boolValue ? "true" : "false";
        } else if (fieldType === "reconciliation_type") {
          const options = fieldConfig.options || [];
          const option = options.find(opt => opt.value === displayValue);
          formattedDisplayValue = option ? option.label : displayValue;
        }

        // Generate input HTML based on field type
        let inputHtml = "";
        if (fieldType === "string") {
          inputHtml = /*html*/ `
            <vscode-text-field
              class="config-input config-input-string"
              data-field-key="${key}"
              value="${this.escapeHtml(String(displayValue))}"
              style="display: none; width: 100%;"
            ></vscode-text-field>`;
        } else if (fieldType === "reconciliation_type") {
          const options = fieldConfig.options || [];
          const optionsHtml = options.map((opt: { value: string; label: string }) =>
            `<vscode-option value="${this.escapeHtml(opt.value)}" ${opt.value === displayValue ? 'selected' : ''}>${this.escapeHtml(opt.label)}</vscode-option>`
          ).join("");
          inputHtml = /*html*/ `
            <vscode-dropdown
              class="config-input config-input-dropdown"
              data-field-key="${key}"
              style="display: none; width: 100%;"
            >
              ${optionsHtml}
            </vscode-dropdown>`;
        }

        // For boolean fields, render checkbox directly instead of text
        if (fieldType === "boolean" && isEditable) {
          const boolValue = actualValue === true || actualValue === "true";
          return /*html*/ `<vscode-data-grid-row>
                  <vscode-data-grid-cell grid-column="1">
                    ${fieldConfig.label}
                  </vscode-data-grid-cell>
                  <vscode-data-grid-cell grid-column="2" class="vs-actions">
                    <vscode-checkbox
                      class="config-checkbox"
                      data-field-key="${key}"
                      data-field-label="${fieldConfig.label}"
                      ${boolValue ? 'checked' : ''}
                    ></vscode-checkbox>
                  </vscode-data-grid-cell>
                </vscode-data-grid-row>`;
        }

        return /*html*/ `<vscode-data-grid-row>
                  <vscode-data-grid-cell grid-column="1">
                    ${fieldConfig.label}
                  </vscode-data-grid-cell>
                  <vscode-data-grid-cell grid-column="2" class="vs-actions">
                    <span
                      class="config-value ${isEditable ? 'editable-click' : ''}"
                      data-field-key="${key}"
                      data-field-label="${fieldConfig.label}"
                      data-field-value="${this.escapeHtml(String(displayValue))}"
                      data-field-type="${fieldType || ''}"
                      title="${isEditable ? 'Click to edit' : ''}"
                    >
                      ${this.escapeHtml(String(formattedDisplayValue))}
                      ${isEditable ? '<i class="codicon codicon-edit" style="margin-left: 8px; opacity: 0.6;"></i>' : ''}
                    </span>
                    ${inputHtml}
                  </vscode-data-grid-cell>
                </vscode-data-grid-row>`;
      })
      .join("");

    const gridLayout = `grid-template-columns="1fr 2fr"`;

    let htmlBody =
      configItemsRows.length > 0
        ? /*html*/ `<vscode-data-grid aria-label="template information" ${gridLayout}>
            <vscode-data-grid-row row-type="header">
              <vscode-data-grid-cell cell-type="columnheader" grid-column="1">
              </vscode-data-grid-cell>
              <vscode-data-grid-cell cell-type="columnheader" grid-column="2">
              </vscode-data-grid-cell>
            </vscode-data-grid-row>
            ${configItemsRows}
          </vscode-data-grid>`
        : `Select a template with a valid "config.json" file to see its information here`;

    let htmlContent = panelUtils.htmlContainer(
      webviewView,
      this._extensionUri,
      htmlBody
    );
    webviewView.webview.html = htmlContent;
  }

  /**
   * Check if a field is editable based on the configuration
   */
  private isEditable(key: string): boolean {
    if (!this.templateType) {
      return false;
    }
    const fieldConfig = this.fieldConfigs[this.templateType]?.[key];
    return fieldConfig?.editable || false;
  }

  /**
   * Get the field type based on the configuration
   */
  private getFieldType(key: string): FieldType {
    if (!this.templateType) {
      return "string";
    }
    const fieldConfig = this.fieldConfigs[this.templateType]?.[key];
    return fieldConfig?.type || "string";
  }

  /**
   * Get field configuration for a specific field
   */
  private getFieldConfig(key: string): FieldConfig | undefined {
    if (!this.templateType) {
      return undefined;
    }
    return this.fieldConfigs[this.templateType]?.[key];
  }

  private registerEvents() {
    const extensionContext = ExtensionContext.get();
    extensionContext.subscriptions.push(
      vscode.window.registerWebviewViewProvider(this.viewType, this)
    );
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand("template-info-panel.refresh", () => {
        if (!this._view) {
          return;
        }
        this.setContent(this._view);
      })
    );
    vscode.window.onDidChangeActiveTextEditor(() => {
      vscode.commands.executeCommand("template-info-panel.refresh");
    });
    vscode.workspace.onDidSaveTextDocument(() => {
      vscode.commands.executeCommand("template-info-panel.refresh");
    });
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
