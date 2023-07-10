import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
const { config } = require("sf_toolkit/lib/api/auth");
const fsUtils = require("sf_toolkit/lib/utils/fsUtils");
const sfToolkit = require("sf_toolkit");

export default class LiquidDiagnostics {
  errorsCollection: vscode.DiagnosticCollection;
  output: vscode.OutputChannel;
  currentLiquidFile: vscode.TextDocument | undefined;
  firmId: Number | undefined;
  templateHandle: string | undefined;
  context: vscode.ExtensionContext;

  constructor(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    this.errorsCollection =
      vscode.languages.createDiagnosticCollection(`LiquidCollection`);
    this.output = outputChannel;
    this.currentLiquidFile = undefined;
    this.context = context;
  }

  public async verifySharedPartsUsed() {
    this.setLiquidFile();
    if (!this.currentLiquidFile) {
      return;
    }
    this.errorsCollection.set(this.currentLiquidFile!.uri, []);
    const sharedPartsUsed = this.searchForSharedPartsInLiquid();
    if (!sharedPartsUsed) {
      return;
    }
    const sharedPartsAdded = await this.getSharedPartsAdded();
    // Compare the two arrays and find the differences (shared parts used but not added)
    const sharedPartsNotAdded = sharedPartsUsed.filter(
      (part) => !sharedPartsAdded.includes(part)
    );
    if (sharedPartsNotAdded.length === 0) {
      return;
    }
    this.output.appendLine(
      "There are shared parts included in liquid but not added to the template"
    );
    this.recreateDiagnosticInformation(sharedPartsNotAdded);
  }

  // Establish which one is the current Liquid File based on activeTextEditor
  private setLiquidFile() {
    this.currentLiquidFile = undefined;
    utils.setCWD();
    if (!vscode.window.activeTextEditor) {
      return;
    }
    const fileType = utils.getCurrentFileExtension();
    if (fileType !== "liquid") {
      return;
    }
    const currentTextDocument = vscode.window.activeTextEditor.document;
    this.currentLiquidFile = currentTextDocument;
    this.output.appendLine("Liquid File found");
  }

  // Inspect the liquid code of the file and search for the use of shared parts
  private searchForSharedPartsInLiquid() {
    const currentLiquid = this.currentLiquidFile?.getText();
    if (!currentLiquid) {
      return;
    }
    // Match a word or everything between quotes ?
    //const regex = /{%\s*include\s+"shared_part\/(\w+)"\s*%}/g;
    const regex = /{%\s*include\s+['"]\s*shared_part\/(.*?)\s*['"]\s*%}/g;
    const matches = [...currentLiquid.matchAll(regex)];
    const names = matches.map((match) => match[1]);
    return names;
  }

  private async getSharedPartsAdded() {
    const firmId = config.getFirmId();
    const templateHandle = templateUtils.getTemplateHandle();
    const templateType = await templateUtils.getTemplateType();
    if (!templateHandle || !firmId || templateType !== "reconciliationText") {
      this.firmId = undefined;
      this.templateHandle = undefined;
      return;
    }
    this.firmId = firmId;
    this.templateHandle = templateHandle;
    const sharedParts = await fsUtils.getSharedParts(firmId, templateHandle);
    return sharedParts;
  }

  // Search for the item in the text to identify the line number
  // Create the Diagnostic object and add it to the collection
  private recreateDiagnosticInformation(sharedParts: string[]) {
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
      // Check if shared part exists
      const allSharedParts = fsUtils.getTemplatePaths("shared_parts");
      const sharedPartExists = allSharedParts.some(
        (existingSharedPart: string) =>
          existingSharedPart.includes(sharedPartName)
      );
      let diagnostic: vscode.Diagnostic;
      if (sharedPartExists) {
        // Create the diagnostic object
        const message = `Shared part "${sharedPartName}" is included here but it is not added to template "${this.templateHandle}" in firm id "${this.firmId}"`;
        diagnostic = new vscode.Diagnostic(
          range,
          message,
          vscode.DiagnosticSeverity.Warning
        );
        // Create commands to add the shared part
        this.createCommandAddSharedPart(sharedPartName);
      } else {
        // Create the diagnostic object
        const message = `Shared part "${sharedPartName}" does not exist`;
        diagnostic = new vscode.Diagnostic(
          range,
          message,
          vscode.DiagnosticSeverity.Error
        );
      }
      diagnostics.push(diagnostic);
    }
    this.errorsCollection.set(this.currentLiquidFile!.uri, diagnostics);
    this.output.appendLine("Errors collection of the Liquid Template updated");
  }

  private async createCommandAddSharedPart(sharedPartName: string) {
    this.output.appendLine(
      `Create command to add shared part ${sharedPartName}`
    );
    let identifier = `addSharedPart.${sharedPartName}.${this.templateHandle}.${this.firmId}`;
    // Check if the command already exists
    const allCommands = await vscode.commands.getCommands();
    if (allCommands.includes(identifier)) {
      return;
    }
    // registerCommand
    this.context.subscriptions.push(
      vscode.commands.registerCommand(identifier, () => {
        // Run the command to add the shared part
        sfToolkit
          .addSharedPartToReconciliation(
            this.firmId,
            sharedPartName,
            this.templateHandle
          )
          .then(() => {
            // Refresh the shared parts
            this.verifySharedPartsUsed();
          });
        // Show a message
        vscode.window.showInformationMessage(
          `Adding shared part ${sharedPartName}...`
        );
      })
    );
  }
}
