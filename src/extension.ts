/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { posix } from "path";
const sfToolkit = require("sf_toolkit");
const { config } = require("sf_toolkit/api/auth");

type ResultArray = {
  test: string;
  result: string;
  got: any;
  expected: any;
  line_number: number;
}[];
type ResponseObject = {
  status: "completed" | "internal_error" | "test_error" | "started";
  result?: ResultArray;
  error_line_number?: number;
  error_message?: string;
};
type DiagnosticObject = {
  range: vscode.Range;
  code?: string;
  message: string;
  severity: vscode.DiagnosticSeverity;
  source: string;
};

let firstRowRange: vscode.Range = new vscode.Range(
  new vscode.Position(0, 0),
  new vscode.Position(0, 500)
);

// Check open file is a Liquid Test
// Check right folder structure && type YAML
// Return templateHandle to run liquid test
async function checkFilePath() {
  // File information
  if (!vscode.window.activeTextEditor) {
    return;
  }
  const filePath = posix.resolve(
    vscode.window.activeTextEditor.document.uri.path
  );
  const fileBasename = posix.basename(filePath);
  const pathParts = posix.dirname(filePath).split(posix.sep);

  // Check /tests directory
  if (pathParts[pathParts.length - 1] !== "tests") {
    vscode.window.showErrorMessage(
      'File is not stored in a "./tests" directory'
    );
    return;
  }

  // Get Template Handle
  const templateHandle = pathParts[pathParts.length - 2];
  const templatePath = posix.dirname(posix.dirname(filePath));

  // Check file name
  const nameRe = new RegExp(`${templateHandle}_liquid_test.yml`);
  const matchName = fileBasename.match(nameRe);
  if (!matchName) {
    vscode.window.showErrorMessage(
      "File name is not correct: [handle]_liquid_test.yml"
    );
    return;
  }

  // Check Config File
  const configPath = posix.join(templatePath, "config.json");
  const configUri = vscode.window.activeTextEditor.document.uri.with({
    path: configPath,
  });
  try {
    await vscode.workspace.fs.stat(configUri);
  } catch (error) {
    vscode.window.showErrorMessage("Config.json is missing");
    return;
  }
  // Set the right path
  const basePath = posix.dirname(posix.dirname(templatePath));
  process.chdir(basePath);

  return templateHandle;
}

export async function activate(context: vscode.ExtensionContext) {
  const credentials =
    process.env.SF_API_CLIENT_ID && process.env.SF_API_SECRET ? true : false;

  // Set Context Key
  // We can use this key in package.json menus.commandPalette to show/hide our commands
  vscode.commands.executeCommand(
    "setContext",
    "silverfin-development-toolkit.apiAuthorized",
    credentials
  );

  // Get Current Document Information
  let currentYaml: vscode.TextDocument;

  // Errors from Liquid Test are stored in a Diagnostic Collection
  const errorsCollection =
    vscode.languages.createDiagnosticCollection(`Collection`);

  // Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  if (credentials) {
    statusBarItem.command = "silverfin-development-toolkit.runTest";
    statusBarItem.text = "Silverfin: run liquid test";
  } else {
    statusBarItem.text = "Silverfin: credentials missing";
  }
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Find in which row of the document a text is located
  // It will return only the first match if repeated
  function findIndexRow(
    document: vscode.TextDocument,
    reExpresion: string,
    startIndex: number = 0
  ): number {
    let lineIndex = startIndex;
    const documentLastRow = document.lineCount - 1;
    const re = new RegExp(reExpresion);
    for (lineIndex; lineIndex < documentLastRow; lineIndex++) {
      let lineText = document.lineAt(lineIndex).text;
      let regExpTest = lineText.match(re);
      if (regExpTest) {
        return lineIndex;
      }
    }
    return 0;
  }

  // Process errors, create Diagnostic Objects with all the needed information
  function handleResponse(
    document: vscode.TextDocument,
    responseResults: ResultArray
  ): Array<DiagnosticObject> {
    const collectionArray: Array<DiagnosticObject> = [];
    for (let testObject of responseResults) {
      let resultParts = testObject.result.split(".");
      let resultType = resultParts.shift();
      let resultJoin;
      if (resultParts.length > 0) {
        resultJoin = resultParts.join(".");
      }

      let diagnosticMessage = `[${
        resultJoin || "Reconciled status"
      }] Expected: ${
        testObject.expected
      } (${typeof testObject.expected}) | Got: ${
        testObject.got
      } (${typeof testObject.got})`;
      let diagnosticLineNumber = testObject.line_number - 1;

      if (resultType !== "reconciled") {
        // Expresion: name: content
        let reExpresion = `${resultParts[resultParts.length - 1]}: (\"|\')${
          testObject.expected
        }(\"|\')`;
        // We first search in it's specific unit test (that's why we filter the index start)
        // If it's not found there we search in the entire file
        // Because of anchor & aliases it could be defined in a preivous test
        let testIndex = findIndexRow(document, testObject.test);
        let newIndex = findIndexRow(document, reExpresion, testIndex);
        if (newIndex && newIndex !== 0) {
          diagnosticLineNumber = newIndex;
        } else {
          newIndex = findIndexRow(document, reExpresion);
          if (newIndex && newIndex !== 0) {
            diagnosticLineNumber = newIndex;
          }
        }
      }
      // Range to highlight
      let highlightStartIndex =
        document.lineAt(diagnosticLineNumber).firstNonWhitespaceCharacterIndex;
      let highlighEndIndex =
        document.lineAt(diagnosticLineNumber).text.split("").length + 1;
      let diagnosticRange = new vscode.Range(
        new vscode.Position(diagnosticLineNumber, highlightStartIndex),
        new vscode.Position(diagnosticLineNumber, highlighEndIndex)
      );

      // Create diagnostic object
      let diagnostic: DiagnosticObject = {
        range: diagnosticRange,
        message: diagnosticMessage,
        severity: vscode.DiagnosticSeverity.Error,
        source: "Liquid Test",
        code: testObject.test,
      };
      collectionArray.push(diagnostic);
    }
    return collectionArray;
  }

  // Process the response from the API call and update the collection
  function updateDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection,
    response: ResponseObject
  ): void {
    let collectionArray: Array<DiagnosticObject> = [];
    if (response.status === "completed") {
      if (document && response.result && response.result.length > 0) {
        // Errors present after liquid test run
        collectionArray = handleResponse(document, response.result);
        collection.set(document.uri, collectionArray);
      } else {
        // No errors after liquid test
        collection.clear();
        vscode.window.showInformationMessage(
          "All tests have passed succesfully!"
        );
      }
    } else if (response.status === "test_error") {
      // Test concluded
      // Error that prevented the Liquid Test to be run
      let diagnosticRange: vscode.Range;
      if (
        response.error_line_number &&
        response.hasOwnProperty("error_line_number")
      ) {
        let highlightStartIndex = document.lineAt(
          response.error_line_number - 1
        ).firstNonWhitespaceCharacterIndex;
        let highlighEndIndex =
          document.lineAt(response.error_line_number - 1).text.split("")
            .length + 1;
        diagnosticRange = new vscode.Range(
          new vscode.Position(
            response.error_line_number - 1,
            highlightStartIndex
          ),
          new vscode.Position(response.error_line_number - 1, highlighEndIndex)
        );
      } else {
        diagnosticRange = firstRowRange;
      }
      let diagnosticMessage;
      if (response.error_message) {
        diagnosticMessage = response.error_message;
      } else {
        diagnosticMessage = "Error message not provided";
      }
      let diagnostic: DiagnosticObject = {
        range: diagnosticRange,
        message: diagnosticMessage,
        severity: vscode.DiagnosticSeverity.Error,
        source: "Liquid Test",
      };
      collectionArray.push(diagnostic);
      collection.set(document.uri, collectionArray);
    } else if (response.status === "internal_error") {
      // Internal error
      statusBarItem.text = "Silverfin: internal error";
      statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.errorBackground"
      );
      let diagnostic: DiagnosticObject = {
        range: firstRowRange,
        message:
          "Internal error. Try to run the test again. If the issue persists, contact support",
        severity: vscode.DiagnosticSeverity.Error,
        source: "Liquid Test",
      };
      collectionArray.push(diagnostic);
      collection.set(document.uri, collectionArray);
    }
  }

  // Run Test Command
  const runTestCommand = "silverfin-development-toolkit.runTest";
  async function runTestCommandHandler() {
    // Check right file & get template handle
    let templateHandle = await checkFilePath();
    if (!templateHandle) {
      return;
    }

    // Check active tab and get document
    if (!vscode.window.activeTextEditor) {
      return;
    }
    currentYaml = vscode.window.activeTextEditor.document;

    // Start Test
    statusBarItem.text = "Silverfin: running test...";
    statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground"
    );
    // Get Firm Stored
    let firmId = await sfToolkit.getDefaultFirmID();
    // Request Firm ID and store it if necessary
    if (!firmId) {
      const newFirmId = await vscode.window.showInputBox({
        prompt:
          "There is no Firm ID stored. Provide one to run the liquid test",
        placeHolder: "123456",
        title: "FIRM ID",
      });
      // No firm id provided via prompt
      if (!newFirmId) {
        statusBarItem.text = "Silverfin: run liquid test";
        statusBarItem.backgroundColor = "";
        return;
      }
      // Store and use new firm id provided
      await sfToolkit.setDefaultFirmID(newFirmId);
      firmId = newFirmId;
    }

    // Check firm id
    const firmIdStored = config.getFirmId();
    const firmCredentials = config.getTokens(firmIdStored);
    if (!firmCredentials) {
      vscode.window.showErrorMessage(
        "You first need to authorize your firm using the CLI"
      );
      return;
    }

    // Run Test
    let response: ResponseObject = await sfToolkit.runTests(
      firmId,
      templateHandle
    );

    // Update status bar
    statusBarItem.text = "Silverfin: run liquid test";
    statusBarItem.backgroundColor = "";
    if (response) {
      // Process response and update collection
      updateDiagnostics(currentYaml, errorsCollection, response);
    } else {
      // Unhandled errors
      vscode.window.showErrorMessage(
        "Unexpected error: use the CLI to get more information"
      );
    }
  }
  // Register Command
  context.subscriptions.push(
    vscode.commands.registerCommand(runTestCommand, runTestCommandHandler)
  );
}

export function deactivate() {}
