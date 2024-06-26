import * as vscode from "vscode";

type MissingSharedPartDetails = {
  sharedPartName: string;
  templateHandle: string;
  templateType: string;
  firmId: string;
  missing: boolean;
};

export default class LiquidQuickFixes implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
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
      // missing shared part?
      let sharedPartDetails = this.getMissingSharedPartFromMessage(diagnostic.message);
      if (sharedPartDetails) {
        let codeAction = this.createMissingSharedPartQuickFix(sharedPartDetails);
        quickFixes.push(codeAction);
      }
      // missing part?
      let partName = this.getMissingPartFromMessage(diagnostic.message);
      if (partName) {
        let codeAction = this.createMissingPartQuickFix(partName);
        quickFixes.push(codeAction);
      }
    }
    return quickFixes;
  }

  /**
   * It extracts the missing shared part details from the diagnostic message
   * @param message - The diagnostic message
   * @returns - The missing shared part details needed to create the quickFix
   */
  private getMissingSharedPartFromMessage(message: string) {
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
      missing: missing
    } as MissingSharedPartDetails;
  }

  /**
   * It extracts the missing part name from the diagnostic message
   * @param message - The diagnostic message
   * @returns - The missing part name needed to create the quickFix
  */
  private getMissingPartFromMessage(message: string) {
    const partRegex = /Part "([^"]+)"/;
    const partMatch = message.match(partRegex);
    const partName = partMatch ? partMatch[1] : undefined;
    return partName;
  }
  
  private createMissingSharedPartQuickFix(details: MissingSharedPartDetails) {
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
      title: title
    };

    return codeActionAddSharedPart;
  }

  private createMissingPartQuickFix(partName: string) {
    let identifier = `addPart.${partName}`;
    let title = `Create part "${partName}" if it does not exist, and add it to the template's config.json file.`;

    // Create the quickFix
    const codeActionCreatePart = new vscode.CodeAction(
      title,
      vscode.CodeActionKind.QuickFix,
    );
    codeActionCreatePart.command = {
      command: identifier,
      title: title
    };

    return codeActionCreatePart;
  }
}
