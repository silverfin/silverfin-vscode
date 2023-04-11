import * as vscode from "vscode";

export class LiquidTestFixer implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

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
      const expectedAndGot = this.getExpectedGotFromMessage(diagnostic.message);
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

  // Create the QuickFix for each diagnostic
  // Replace the "expected" value with the "got" value
  private createReplaceFix(
    document: vscode.TextDocument,
    range: vscode.Range,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction | undefined {
    const expectedAndGot = this.getExpectedGotFromMessage(diagnostic.message);
    const got = expectedAndGot[1].toString().trim();
    const rowContent = document.lineAt(range.start.line);
    const indexContentStart = rowContent.text.match(/:/)?.index;
    const indexContentEnd =
      document.lineAt(range.start.line).text.split("").length + 1;
    // no match ":" or element is empty after ":"
    if (!indexContentStart || indexContentStart + 2 === indexContentEnd) {
      return;
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
        new vscode.Position(range.start.line, indexContentStart + 2),
        new vscode.Position(range.start.line, indexContentEnd)
      ),
      got
    );
    return fixReplace;
  }

  // Return: [expected, got]
  private getExpectedGotFromMessage(message: string): string[] {
    const output = [];
    const expectedRegex = /Expected:\s*([^(]+)/g;
    const expectedMatch = message.match(expectedRegex);
    if (expectedMatch) {
      output.push(expectedMatch[0].replace("Expected: ", ""));
    } else {
      output.push("");
    }
    const gotRegex = /Got:\s*([^(]+)/g;
    const gotMatch = message.match(gotRegex);
    if (gotMatch) {
      output.push(gotMatch[0].replace("Got: ", ""));
    } else {
      output.push("");
    }
    return output;
  }
}
