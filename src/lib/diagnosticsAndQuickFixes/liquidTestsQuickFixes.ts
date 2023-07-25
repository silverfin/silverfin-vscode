import * as vscode from "vscode";
import * as diagnostics from "./liquidTestsDiagnostics";

export default class LiquidTestQuickFixes implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  // Provide the QuickFixes for each diagnostic
  // It looks at the existing collection of diagnostics in the context
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    let quickFixes: vscode.CodeAction[] = [];
    for (let diagnostic of context.diagnostics) {
      // TODO We can use the diagnostic.code to define different types of fixes
      // For example: "nothing" => non_existent_row => remove row
      // For example: missing results => missing_row => add results in a new row
      // TODO We can use the diagnostic.source to search the item in the YAML tree instead of relying on the line number
      // Amount of rows can change, so we can't rely on the line number
      // Also, using the YAML tree we can add new rows precisely where they should be
      const expectedAndGot = diagnostics.getExpectedGotFromMessage(
        diagnostic.message
      );
      const got = expectedAndGot[1].toString().trim();
      let codeAction: vscode.CodeAction | undefined;
      // if 'nothing', then we should remove the entire line
      if (got === "nothing") {
        codeAction = this.createRemoveRow(document, range);
      } else {
        codeAction = this.createReplaceFix(document, range, diagnostic);
      }
      if (codeAction) {
        quickFixes.push(codeAction);
      }
    }
    return quickFixes;
  }

  // QuickFix: remove the entire row
  private createRemoveRow(document: vscode.TextDocument, range: vscode.Range) {
    const fixDeleteRow = new vscode.CodeAction(
      `Remove row`,
      vscode.CodeActionKind.QuickFix
    );
    fixDeleteRow.edit = new vscode.WorkspaceEdit();
    fixDeleteRow.edit.delete(
      document.uri,
      new vscode.Range(
        new vscode.Position(range.start.line, 0),
        new vscode.Position(range.start.line + 1, 0)
      )
    );
    return fixDeleteRow;
  }

  // QuickFix: Replace the "expected" value with the "got" value
  private createReplaceFix(
    document: vscode.TextDocument,
    range: vscode.Range,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction | undefined {
    const expectedAndGot = diagnostics.getExpectedGotFromMessage(
      diagnostic.message
    );
    let got = expectedAndGot[1].toString().trim();
    const rowContent = document.lineAt(range.start.line);
    let indexContentStart = rowContent.text.match(/:/)?.index;
    let indexContentEnd =
      document.lineAt(range.start.line).text.split("").length + 1;
    // no match ":" => item not identified, then we can't replace anything
    if (!indexContentStart) {
      return;
    }
    // +2 to consider ":" and and extra whitespace
    indexContentStart += 2;
    // Strings should be wrapped in double quotes
    const numberCheck = Number(got);
    if (Number.isNaN(numberCheck) && got !== "null") {
      got = '"' + got + '"';
    }
    // element is empty after ":" => we need to add one extra space after ":"
    if (indexContentStart === indexContentEnd) {
      got = " " + got;
    }
    // Fix to replace content after ":" with the "got" value
    const fixReplace = new vscode.CodeAction(
      `Set to ${got}`,
      vscode.CodeActionKind.QuickFix
    );
    fixReplace.edit = new vscode.WorkspaceEdit();
    fixReplace.edit.replace(
      document.uri,
      new vscode.Range(
        new vscode.Position(range.start.line, indexContentStart),
        new vscode.Position(range.start.line, indexContentEnd)
      ),
      got
    );
    return fixReplace;
  }
}
