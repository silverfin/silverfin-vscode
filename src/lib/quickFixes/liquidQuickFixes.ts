import * as vscode from "vscode";

export default class LiquidQuickFixes implements vscode.CodeActionProvider {
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
      let details = this.getDetailsFromMessage(diagnostic.message);
      if (!details) {
        continue;
      }
      let identifier = `addSharedPart.${details.sharedPartName}.${details.templateHandle}.${details.templateType}.${details.firmId}`;
      let title = `${details.missing ? "Create and add" : "Add"} shared part "${
        details.sharedPartName
      }" to template "${details.templateHandle}" in firm "${details.firmId}"`;
      const codeActionAddSharedPart = new vscode.CodeAction(
        title,
        vscode.CodeActionKind.QuickFix
      );
      // Command is created when the diagnostic is created
      // Attach command to quickFix
      codeActionAddSharedPart.command = {
        command: identifier,
        title: title,
      };
      quickFixes.push(codeActionAddSharedPart);
    }
    return quickFixes;
  }

  private getDetailsFromMessage(message: string) {
    const sharedPartRegex = /Shared part "([^"]+)"/;
    const templateRegex = /template "([^"]+)"/;
    const firmIdRegex = /firm id "([^"]+)"/;
    const templateTypeRegex = /template type: "([^"]+)"/;
    const missingRegex = /not exist/;
    const sharedPartMatch = message.match(sharedPartRegex);
    const templateMatch = message.match(templateRegex);
    const firmIdMatch = message.match(firmIdRegex);
    const missingMatch = message.match(missingRegex);
    const templateTypeMatch = message.match(templateTypeRegex);
    const sharedPartName = sharedPartMatch ? sharedPartMatch[1] : undefined;
    const templateHandle = templateMatch ? templateMatch[1] : undefined;
    const firmId = firmIdMatch ? firmIdMatch[1] : undefined;
    const templateType = templateTypeMatch ? templateTypeMatch[1] : undefined;
    const missing = missingMatch ? true : false;
    if (!sharedPartName || !templateHandle || !templateType || !firmId) {
      return undefined;
    }
    return {
      sharedPartName: sharedPartName,
      templateHandle: templateHandle,
      templateType: templateType,
      firmId: firmId,
      missing: missing,
    };
  }
}
