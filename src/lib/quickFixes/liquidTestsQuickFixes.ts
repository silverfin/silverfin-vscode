import * as vscode from "vscode";
import * as diagnosticsUtils from "../../utilities/diagnosticsUtils";
import ExtensionLoggerWrapper from "../outputChannels/extensionLoggerWrapper";

export default class LiquidTestQuickFixes implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];
  private extensionLogger: ExtensionLoggerWrapper = new ExtensionLoggerWrapper(
    "liquidTestsQuickFixes"
  );

  // Provide the QuickFixes for each diagnostic
  // It looks at the existing collection of diagnostics in the context
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    let quickFixes: vscode.CodeAction[] = [];
    for (let diagnostic of context.diagnostics) {
      // TODO We can use the diagnostic.source to search the item in the YAML tree instead of relying on the line number
      // Amount of rows can change, so we can't rely on the line number
      // Also, using the YAML tree we can add new rows precisely where they should be
      const expectedAndGot = diagnosticsUtils.getExpectedGotFromMessage(
        diagnostic.message
      );
      const expected = expectedAndGot.expected;
      const got = expectedAndGot.got;

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
    const expectedAndGot = diagnosticsUtils.getExpectedGotFromMessage(
      diagnostic.message
    );

    const resultName = expectedAndGot.name;
    const originalGot = expectedAndGot.got;
    const expected = expectedAndGot.expected;
    const type = expectedAndGot.type;
    let formattedGot = originalGot;

    // null and arrays are seen as objects and require special formatting
    if (type === "object") {
      if (originalGot === "null") {
        formattedGot = "null";
      } else {
        formattedGot = `[${originalGot
          .split(",")
          .map((item: any) => `"${item.trim()}"`)
          .join(", ")}]`;
      }
    }

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
    // Arrays won't have quotes and won't be numbers should be wrapped in square brackets
    // Booleans will be true or false and not wrapped within quotes

    // element is empty after ":" => we need to add one extra space after ":"
    if (indexContentStart === indexContentEnd) {
      formattedGot = " " + formattedGot;
    }

    let fixProposal: vscode.CodeAction;

    if (expected === "nothing") {
      const newLine = `\n      ${resultName}: ${formattedGot}`;

      fixProposal = new vscode.CodeAction(
        `Add line for ${resultName}: ${formattedGot}`,
        vscode.CodeActionKind.QuickFix
      );
      fixProposal.edit = new vscode.WorkspaceEdit();
      fixProposal.edit.insert(
        document.uri,
        new vscode.Position(range.start.line, indexContentStart),
        newLine
      );
    } else {
      // Fix to replace content after ":" with the "got" value
      fixProposal = new vscode.CodeAction(
        `Set to ${formattedGot}`,
        vscode.CodeActionKind.QuickFix
      );
      fixProposal.edit = new vscode.WorkspaceEdit();
      fixProposal.edit.replace(
        document.uri,
        new vscode.Range(
          new vscode.Position(range.start.line, indexContentStart),
          new vscode.Position(range.start.line, indexContentEnd)
        ),
        formattedGot
      );
    }

    return fixProposal;
  }
}
