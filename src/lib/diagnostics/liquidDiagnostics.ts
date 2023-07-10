import * as vscode from "vscode";
import * as templateUtils from "../../utilities/templateUtils";
import * as utils from "../../utilities/utils";
const { config } = require("sf_toolkit/lib/api/auth");
const fsUtils = require("sf_toolkit/lib/utils/fsUtils");

export default class LiquidDiagnostics {
  errorsCollection: vscode.DiagnosticCollection;
  output: vscode.OutputChannel;
  currentLiquidFile: vscode.TextDocument | undefined;
  firmId: Number | undefined;

  constructor(outputChannel: vscode.OutputChannel) {
    this.errorsCollection =
      vscode.languages.createDiagnosticCollection(`LiquidCollection`);
    this.output = outputChannel;
    this.currentLiquidFile = undefined;
  }

  public async verifySharedPartsUsed() {
    this.setLiquidFile();
    if (!this.currentLiquidFile) {
      return;
    }
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
    if (!firmId) {
      this.firmId = undefined;
      return;
    }
    this.firmId = firmId;
    const templateHandle = templateUtils.getTemplateHandle();
    const sharedParts = await fsUtils.getSharedParts(firmId, templateHandle);
    return sharedParts;
  }

  // Search for the item in the text to identify the line number
  // Create the Diagnostic object and add it to the collection
  private recreateDiagnosticInformation(items: string[]) {
    const diagnostics: vscode.Diagnostic[] = [];
    for (let item of items) {
      let indexOf = this.currentLiquidFile?.getText().indexOf(item);
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
      const message = `Shared part "${item}" is included here but it is not added to this template yet in firm id ${this.firmId}`;
      const diagnostic = new vscode.Diagnostic(
        range,
        message,
        vscode.DiagnosticSeverity.Warning
      );
      diagnostics.push(diagnostic);
    }
    this.errorsCollection.set(this.currentLiquidFile!.uri, diagnostics);
    this.output.appendLine("Errors collection of the Liquid Template updated");
  }
}
