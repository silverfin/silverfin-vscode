import * as vscode from "vscode";
import FirmIdCommand from "./firmIdCommand";
import * as types from "./types";
import * as utils from "./utils";
const sfToolkit = require("sf_toolkit");
const { config } = require("sf_toolkit/api/auth");

export async function activate(context: vscode.ExtensionContext) {
  // Output Channel
  const outputChannel = vscode.window.createOutputChannel("Silverfin");

  // API Credentials
  const credentials =
    process.env.SF_API_CLIENT_ID && process.env.SF_API_SECRET ? true : false;
  outputChannel.appendLine(`Credentials: ${credentials}`);

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

  // Load Errors stored for open file if any
  if (vscode.window.activeTextEditor) {
    utils.loadStoredDiagnostics(
      vscode.window.activeTextEditor.document,
      outputChannel,
      context,
      errorsCollection
    );
  }

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

  // Show/Hide statusBar (based on activeTab is YAML file)
  vscode.window.onDidChangeActiveTextEditor((e) => {
    const fileName = vscode.window.activeTextEditor?.document.fileName;
    if (!fileName) {
      return;
    }
    const fileNameParts = fileName.split(".");
    const fileType = fileNameParts[fileNameParts.length - 1].toLowerCase();
    if (fileType === "yaml" || fileType === "yml") {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  });

  // Get Firm ID or set a new one
  async function setFirmID() {
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
    return firmId;
  }

  // Process errors, create Diagnostic Objects with all the needed information
  function createDiagnostics(
    document: vscode.TextDocument,
    testFeedback: types.testObject
  ): types.DiagnosticObject[] {
    const collectionArray: types.DiagnosticObject[] = [];
    const testNames = Object.keys(testFeedback);
    testNames.forEach((testName) => {
      let testObject = testFeedback[testName];
      let resultsAndRollforwardsNames = Object.keys(testObject.results).concat(
        Object.keys(testObject.rollforwards)
      );
      let resultsAndRollforwardsObjects = {
        ...testObject.results,
        ...testObject.rollforwards,
      };

      if (testObject.reconciled) {
        // MESSAGE
        let diagnosticMessage = `[${"Reconciled status"}] Expected: ${
          testObject.reconciled.expected
        } (${typeof testObject.reconciled.expected}) | Got: ${
          testObject.reconciled.got
        } (${typeof testObject.reconciled.got})`;
        let diagnosticLineNumber = testObject.reconciled.line_number - 1;
        // Range to highlight
        let highlightStartIndex =
          document.lineAt(
            diagnosticLineNumber
          ).firstNonWhitespaceCharacterIndex;
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
          code: testName,
        };
        collectionArray.push(diagnostic);
      }

      resultsAndRollforwardsNames.forEach((itemName) => {
        let itemObject = resultsAndRollforwardsObjects[itemName];
        // NAME
        let nameParts = itemName.split(".");
        let nameJoin;
        if (nameParts.length > 0) {
          nameJoin = nameParts.join(".");
        }
        // MESSAGE
        let diagnosticMessage = `[${nameJoin}] Expected: ${
          itemObject.expected
        } (${typeof itemObject.expected}) | Got: ${
          itemObject.got
        } (${typeof itemObject.got})`;
        let diagnosticLineNumber = itemObject.line_number - 1;

        // Expresion: name: content
        let reExpresion = `${nameParts[nameParts.length - 1]}: (\"|\')${
          itemObject.expected
        }(\"|\')`;
        // We first search in it's specific unit test (that's why we filter the index start)
        // If it's not found there we search in the entire file
        // Because of anchor & aliases it could be defined in a preivous test
        let testIndex = utils.findIndexRow(document, testName);
        let newIndex = utils.findIndexRow(document, reExpresion, testIndex);
        if (newIndex && newIndex !== 0) {
          diagnosticLineNumber = newIndex;
        } else {
          newIndex = utils.findIndexRow(document, reExpresion);
          if (newIndex && newIndex !== 0) {
            diagnosticLineNumber = newIndex;
          }
        }
        // Range to highlight
        let highlightStartIndex =
          document.lineAt(
            diagnosticLineNumber
          ).firstNonWhitespaceCharacterIndex;
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
          code: testName,
        };
        collectionArray.push(diagnostic);
      });
    });
    return collectionArray;
  }

  // Process the response from the API call and update the collection
  function processResponse(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection,
    response: types.ResponseObject
  ): void {
    let collectionArray: types.DiagnosticObject[] = [];
    switch (response.status) {
      case "completed":
        const errorsPresent = sfToolkit.checkAllTestsErrorsPresent(
          response.tests
        );
        if (errorsPresent) {
          // Errors present after liquid test run
          collectionArray = createDiagnostics(document, response.tests);
          collection.set(document.uri, collectionArray);
        } else {
          // No errors after liquid test
          collection.set(document.uri, []);
          vscode.window.showInformationMessage(
            "All tests have passed succesfully!"
          );
        }
        break;

      case "test_error":
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
            new vscode.Position(
              response.error_line_number - 1,
              highlighEndIndex
            )
          );
        } else {
          diagnosticRange = utils.firstRowRange;
        }
        let diagnosticMessage;
        if (response.error_message) {
          diagnosticMessage = response.error_message;
        } else {
          diagnosticMessage = "Error message not provided";
        }
        let diagnosticError: types.DiagnosticObject = {
          range: diagnosticRange,
          message: diagnosticMessage,
          severity: vscode.DiagnosticSeverity.Error,
          source: "Liquid Test",
        };
        collectionArray.push(diagnosticError);
        collection.set(document.uri, collectionArray);
        break;

      case "internal_error":
        statusBarItem.text = "Silverfin: internal error";
        statusBarItem.backgroundColor = new vscode.ThemeColor(
          "statusBarItem.errorBackground"
        );
        let diagnosticInternal: types.DiagnosticObject = {
          range: utils.firstRowRange,
          message:
            "Internal error. Try to run the test again. If the issue persists, contact support",
          severity: vscode.DiagnosticSeverity.Error,
          source: "Liquid Test",
        };
        collectionArray.push(diagnosticInternal);
        collection.set(document.uri, collectionArray);
        break;
    }
    // Store Diagnostic Objects
    context.globalState.update(document.uri.toString(), collectionArray);
  }

  // Run Test Command
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

    // Get Firm Stored
    let firmId = await setFirmID();

    // Check firm id credetials
    const firmIdStored = config.getFirmId();
    const firmCredentials = config.getTokens(firmIdStored);
    if (!firmCredentials) {
      vscode.window.showErrorMessage(
        `Firm ID: ${firmIdStored}. You first need to authorize your firm using the CLI`
      );
      outputChannel.appendLine(
        `Firm ID: ${firmIdStored}. Pair of access/refresh tokens missing from config`
      );
      return;
    }

    // Start Test - Status Bar
    statusBarItem.text = "Silverfin: running test...";
    statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground"
    );

    // Run Test
    let response: types.ResponseObject = await sfToolkit.runTests(
      firmId,
      templateHandle
    );
    outputChannel.appendLine(
      `Firm ID: ${firmId}. Template: ${templateHandle}. Response: ${JSON.stringify(
        response
      )}`
    );

    // Update status bar
    statusBarItem.text = "Silverfin: run liquid test";
    statusBarItem.backgroundColor = "";

    if (!response) {
      // Unhandled errors
      vscode.window.showErrorMessage(
        "Unexpected error: use the CLI to get more information"
      );
      return;
    }

    // Process response and update collection
    processResponse(currentYaml, errorsCollection, response);
  }
  // Register Command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "silverfin-development-toolkit.runTest",
      runTestCommandHandler
    )
  );

  // When a new file is opened for the first time. Load the Diagnostic stored from previous runs
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(async (currentDocument) => {
      utils.loadStoredDiagnostics(
        currentDocument,
        outputChannel,
        context,
        errorsCollection
      );
    })
  );

  // Command to clean Diagnostic Collection of current file
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "silverfin-development-toolkit.clearCurrentDiagnosticCollection",
      () => {
        if (!vscode.window.activeTextEditor) {
          return;
        }
        errorsCollection.set(vscode.window.activeTextEditor.document.uri, []);
      }
    )
  );

  // Command to set Firm ID via prompt and store it
  new FirmIdCommand(context);
}

export function deactivate() {}
