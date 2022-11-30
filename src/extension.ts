import * as vscode from "vscode";
import * as utils from "./utils";
import * as types from "./types";
const sfToolkit = require("sf_toolkit");
const { config } = require("sf_toolkit/api/auth");

let firstRowRange: vscode.Range = new vscode.Range(
  new vscode.Position(0, 0),
  new vscode.Position(0, 500)
);

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

  // Process errors, create Diagnostic Objects with all the needed information
  function createDiagnostics(
    document: vscode.TextDocument,
    responseResults: types.ResultArray
  ): types.DiagnosticObject[] {
    const collectionArray: types.DiagnosticObject[] = [];
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
        let testIndex = utils.findIndexRow(document, testObject.test);
        let newIndex = utils.findIndexRow(document, reExpresion, testIndex);
        if (newIndex && newIndex !== 0) {
          diagnosticLineNumber = newIndex;
        } else {
          newIndex = utils.findIndexRow(document, reExpresion);
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
      let diagnostic: types.DiagnosticObject = {
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
  function processResponse(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection,
    response: types.ResponseObject
  ): void {
    let collectionArray: types.DiagnosticObject[] = [];
    if (response.status === "completed") {
      if (document && response.result && response.result.length > 0) {
        // Errors present after liquid test run
        collectionArray = createDiagnostics(document, response.result);
        collection.set(document.uri, collectionArray);
      } else {
        // No errors after liquid test
        collection.set(document.uri, []);
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
      let diagnostic: types.DiagnosticObject = {
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
      let diagnostic: types.DiagnosticObject = {
        range: firstRowRange,
        message:
          "Internal error. Try to run the test again. If the issue persists, contact support",
        severity: vscode.DiagnosticSeverity.Error,
        source: "Liquid Test",
      };
      collectionArray.push(diagnostic);
      collection.set(document.uri, collectionArray);
    }
    // Store Diagnostic Objects
    context.globalState.update(document.uri.toString(), collectionArray);
  }

  // Run Test Command
  const runTestCommand = "silverfin-development-toolkit.runTest";
  async function runTestCommandHandler() {
    // Check right file
    let checksPassed = await utils.checkFilePath();
    if (!checksPassed) {
      return;
    }
    // Get template handle
    let templateHandle = await utils.getTemplateHandle();
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
    let response: types.ResponseObject = await sfToolkit.runTests(
      firmId,
      templateHandle
    );

    // Update status bar
    statusBarItem.text = "Silverfin: run liquid test";
    statusBarItem.backgroundColor = "";
    if (response) {
      // Process response and update collection
      processResponse(currentYaml, errorsCollection, response);
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

  // When a new file is opened for the first time. Load the Diagnostic stored from previous runs
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(async (file) => {
      if (file && vscode.window.activeTextEditor) {
        let currentDocument = vscode.window.activeTextEditor.document;
        let storedDiagnostics: types.StoredDiagnostic[] | undefined =
          await context.globalState.get(currentDocument.uri.toString());
        if (storedDiagnostics) {
          // Recreate Diagnostic Objects
          let collectionArray: types.DiagnosticObject[] = [];
          for (let diagnosticStored of storedDiagnostics) {
            let diagnosticRecreated: types.DiagnosticObject = {
              range: new vscode.Range(
                new vscode.Position(
                  diagnosticStored.range[0].line,
                  diagnosticStored.range[0].character
                ),
                new vscode.Position(
                  diagnosticStored.range[1].line,
                  diagnosticStored.range[1].character
                )
              ),
              message: diagnosticStored.message,
              severity: vscode.DiagnosticSeverity.Error,
              source: diagnosticStored.source,
              code: diagnosticStored.code,
            };
            collectionArray.push(diagnosticRecreated);
          }
          // Load the Diagnostics
          errorsCollection.set(currentDocument.uri, collectionArray);
        }
      }
    })
  );

  // Trigger event whenever we select/type/delete text in the editor
  /*
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((activeTab) => {
      if (activeTab) {
        // Diagnostics of the Document
        const documentDiagnostics = vscode.languages.getDiagnostics(
          activeTab.textEditor.document.uri
        );
        // Find Text in a range
        const text = activeTab.textEditor.document.getText(
          new vscode.Range(
            new vscode.Position(11, 4),
            new vscode.Position(11, 21)
          )
        );
        console.log(documentDiagnostics);
        console.log(text);
      }
    })
  );
  */
}

export function deactivate() {}
