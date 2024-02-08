import { posix } from "path";
import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
const { firmCredentials } = require("silverfin-cli/lib/api/firmCredentials");
const sfCliFsUtils = require("silverfin-cli/lib/utils/fsUtils");
const sfCli = require("silverfin-cli");

export default class LiquidDiagnostics {
  errorsCollection: vscode.DiagnosticCollection;
  output: vscode.OutputChannel;
  currentLiquidFile: vscode.TextDocument | undefined;
  firmId: Number | undefined;
  templateHandle: string | undefined;
  templateType: string | undefined;
  context: vscode.ExtensionContext;

  constructor(
    context: vscode.ExtensionContext,
    outputChannelLog: vscode.OutputChannel
  ) {
    this.errorsCollection =
      vscode.languages.createDiagnosticCollection(`LiquidCollection`);
    this.output = outputChannelLog;
    this.currentLiquidFile = undefined;
    this.context = context;
  }

  public async verifySharedPartsUsed() {
    this.setLiquidFile(); // sets this.currentLiquidFile
    if (!this.currentLiquidFile) {
      this.output.appendLine("[Diagnostics] Current file is not .liquid");
      return;
    }
    const templateType = await templateUtils.getTemplateType();
    if (templateType === "sharedPart" || !templateType) {
      this.output.appendLine(
        `[Diagnostics] Current template type not supported (type: ${templateType})`
      );
      return;
    }

    // Clear the collection
    this.errorsCollection.set(this.currentLiquidFile!.uri, []);
    const sharedPartsUsed = this.searchForSharedPartsInLiquid();

    if (!sharedPartsUsed) {
      this.output.appendLine("[Diagnostics] No shared parts found");
      return;
    }

    const sharedPartsAdded = (await this.getSharedPartsAdded()) || [];
    // Compare the two arrays and find the differences (shared parts used but not added)
    const sharedPartsNotAdded = sharedPartsUsed.filter(
      (part) => !sharedPartsAdded.includes(part)
    );
    if (sharedPartsNotAdded.length === 0) {
      this.output.appendLine(
        "[Diagnostics] All shared parts are already added."
      );
      return;
    }
    this.output.appendLine(
      "[Diagnostics] There are shared parts included in liquid but not added to the template"
    );
    await this.recreateDiagnosticInformation(sharedPartsNotAdded);
  }

  // Establish which one is the current Liquid File based on activeTextEditor
  private setLiquidFile() {
    this.currentLiquidFile = undefined;
    const cwd = utils.setCWD();
    if (!vscode.window.activeTextEditor || !cwd) {
      return false;
    }
    const fileType = utils.getCurrentFileExtension();
    if (fileType !== "liquid") {
      return false;
    }
    const currentTextDocument = vscode.window.activeTextEditor.document;
    this.currentLiquidFile = currentTextDocument;
    this.output.appendLine("[Diagnostics] Liquid File found");
    return true;
  }

  // Inspect the liquid code of the file and search for the use of shared parts
  private searchForSharedPartsInLiquid() {
    const currentLiquid = this.currentLiquidFile?.getText();
    if (!currentLiquid) {
      this.output.appendLine("[Diagnostics] No Liquid code found");
      return;
    }
    // Match the shared parts included in the liquid code
    // Avoid matching the shared parts included in a comment
    const regex =
      /(?<!\{%\s*comment\s*%\}){%\s*include\s+['"]\s*shared\/(.*?)\s*['"]\s*%}(?!\s*\{%\s*endcomment\s*%\})/g;
    const matches = [...currentLiquid.matchAll(regex)];
    const names = matches.map((match) => match[1]);
    return names;
  }

  private async getSharedPartsAdded() {
    await firmCredentials.loadCredentials(); // refresh credentials
    const firmId = await firmCredentials.getDefaultFirmId();
    const templateHandle = await templateUtils.getTemplateHandle();
    const templateType = await templateUtils.getTemplateType();
    if (
      !templateHandle ||
      !firmId ||
      templateType === "sharedPart" ||
      !templateType
    ) {
      this.firmId = undefined;
      this.templateHandle = undefined;
      this.templateType = undefined;
      return;
    }
    this.firmId = firmId;
    this.templateHandle = templateHandle;
    this.templateType = templateType;
    const sharedParts = await sfCliFsUtils.listSharedPartsUsedInTemplate(
      this.firmId,
      this.templateType,
      this.templateHandle
    );
    return sharedParts;
  }

  // Search for the item in the text to identify the line number
  // Create the Diagnostic object and add it to the collection
  private async recreateDiagnosticInformation(sharedParts: string[]) {
    const diagnostics: vscode.Diagnostic[] = [];
    for (let sharedPartName of sharedParts) {
      let indexOf = this.currentLiquidFile?.getText().indexOf(sharedPartName);
      if (!indexOf) {
        continue;
      }
      const itemPosition = this.currentLiquidFile?.positionAt(indexOf);
      if (!itemPosition) {
        continue;
      }
      // Range to highlight
      let highlightStartIndex =
        this.currentLiquidFile?.lineAt(itemPosition.line)
          .firstNonWhitespaceCharacterIndex || 0;
      let highlighEndIndex =
        this.currentLiquidFile?.lineAt(itemPosition.line).text.split("")
          .length || 50;
      const range = new vscode.Range(
        itemPosition.line,
        highlightStartIndex,
        itemPosition.line,
        highlighEndIndex
      );

      // Check if shared part exists in directory
      const allSharedPartsNames =
        sfCliFsUtils.getAllTemplatesOfAType("sharedPart");
      const sharedPartExistsInDirectory = allSharedPartsNames.some(
        (existingSharedPart: string) =>
          existingSharedPart.includes(sharedPartName)
      );

      let diagnostic: vscode.Diagnostic;
      if (sharedPartExistsInDirectory) {
        // Check if shared part exists in firm
        let sharedPartExistsInFirm = false;
        const configData = await this.getSharedPartConfigData(sharedPartName);
        if (configData && configData.id && this.firmId) {
          sharedPartExistsInFirm = Object.keys(configData.id).includes(
            this.firmId.toString()
          );
        }
        // Create the diagnostic object
        // The message must include the shared part name, template handle, template type and firm id
        // They are used to create the quick fix command
        const message = `Shared part "${sharedPartName}" is included here. It does ${
          sharedPartExistsInFirm ? "" : "not "
        }exist in firm id "${this.firmId}" ${
          sharedPartExistsInFirm ? "but" : "and"
        } it is not added to template "${
          this.templateHandle
        }" (template type: "${this.templateType}")`;
        diagnostic = new vscode.Diagnostic(
          range,
          message,
          vscode.DiagnosticSeverity.Warning
        );
        // Create commands to add the shared part
        await this.createCommandAddSharedPart(
          sharedPartName,
          sharedPartExistsInFirm
        );
      } else {
        // Create the diagnostic object
        const message = `Shared part "${sharedPartName}" does not exist in the "/shared_parts" directory`;
        diagnostic = new vscode.Diagnostic(
          range,
          message,
          vscode.DiagnosticSeverity.Error
        );
      }
      diagnostics.push(diagnostic);
    }
    this.errorsCollection.set(this.currentLiquidFile!.uri, diagnostics);
    this.output.appendLine(
      "[Diagnostics] Errors collection of the Liquid Template updated"
    );
  }

  private async createCommandAddSharedPart(
    sharedPartName: string,
    existsInFirm: boolean
  ) {
    let identifier = `addSharedPart.${sharedPartName}.${this.templateHandle}.${this.templateType}.${this.firmId}`;
    this.output.appendLine(
      `[Diagnostics] Create command to add shared part ${sharedPartName}. Identifier: ${identifier}`
    );
    // Check if the command already exists
    const allCommands = await vscode.commands.getCommands();
    if (allCommands.includes(identifier)) {
      return;
    }
    // registerCommand
    this.context.subscriptions.push(
      vscode.commands.registerCommand(identifier, () => {
        // Create and add the shared part
        if (!existsInFirm) {
          this.createAndAddSharedPart(sharedPartName);
        } else {
          // Only add the shared part to the reconciliation
          this.addSharedPart(sharedPartName);
        }
      })
    );
  }

  private getSharedPartConfigPath(sharedPartName: string) {
    utils.setCWD();
    const cwdPath = posix.resolve(process.cwd());
    const sharedPartConfigPath = posix.join(
      cwdPath,
      "shared_parts",
      sharedPartName,
      "config.json"
    );
    this.output.appendLine(
      `[Diagnostics] Shared Part config path: ${sharedPartConfigPath}`
    );
    return sharedPartConfigPath;
  }

  private async getSharedPartConfigData(sharedPartName: string) {
    if (!vscode.window.activeTextEditor) {
      return false;
    }
    const configPath = this.getSharedPartConfigPath(sharedPartName);
    const configUri = vscode.window.activeTextEditor.document.uri.with({
      path: configPath,
    });
    const fs = require("fs");
    const configExists = fs.existsSync(configPath);
    if (!configExists) {
      return false;
    }
    const configTextDocument = await vscode.workspace.openTextDocument(
      configUri
    );
    if (!configTextDocument) {
      return false;
    }
    return JSON.parse(configTextDocument.getText());
  }

  private addSharedPart(sharedPartName: string) {
    sfCli
      .addSharedPart(
        this.firmId,
        sharedPartName,
        this.templateHandle,
        this.templateType
      )
      .then(() => {
        // Refresh the shared parts
        this.verifySharedPartsUsed();
      });
    // Show a message
    vscode.window.showInformationMessage(
      `Adding shared part ${sharedPartName} to ${this.templateHandle} (${this.templateType})`
    );
  }

  private createAndAddSharedPart(sharedPartName: string) {
    sfCli.newSharedPart(this.firmId, sharedPartName).then(() => {
      sfCli
        .addSharedPart(
          this.firmId,
          sharedPartName,
          this.templateHandle,
          this.templateType
        )
        .then(() => {
          // Refresh the shared parts
          this.verifySharedPartsUsed();
        });
    });
    // Show a message
    vscode.window.showInformationMessage(
      `Creating and adding shared part ${sharedPartName} in firm ${this.firmId} to ${this.templateHandle} (${this.templateType})`
    );
  }
}
