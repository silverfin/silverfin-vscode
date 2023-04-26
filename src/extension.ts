import * as vscode from "vscode";
import FirmHandler from "./lib/firmHandler";
import LiquidLinter from "./lib/liquidLinter";
import StatusBarItem from "./lib/statusBarItem";
import * as types from "./lib/types";
import * as utils from "./lib/utils";
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

  let currentYamlDocument: vscode.TextDocument;
  let htmlPanel: vscode.WebviewPanel | undefined;

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

  const statusBarItemRunTests = new StatusBarItem(context, credentials);

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
        statusBarItemRunTests.setStateIdle();
        return;
      }
      // Store and use new firm id provided
      await sfToolkit.setDefaultFirmID(newFirmId);
      firmId = newFirmId;
    }
    return firmId;
  }

  async function checkFirmCredentials() {
    const firmIdStored = config.getFirmId();
    const firmCredentials = config.getTokens(firmIdStored);
    if (!firmCredentials) {
      vscode.window.showErrorMessage(
        `Firm ID: ${firmIdStored}. You first need to authorize your firm using the CLI`
      );
      outputChannel.appendLine(
        `Firm ID: ${firmIdStored}. Pair of access/refresh tokens missing from config`
      );
      return false;
    }
    return true;
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
          source: testObject.reconciled.got,
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
          source: itemObject.got,
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
          source: "error_message",
        };
        collectionArray.push(diagnosticError);
        collection.set(document.uri, collectionArray);
        break;

      case "internal_error":
        statusBarItemRunTests.setStateInternalError();
        let diagnosticInternal: types.DiagnosticObject = {
          range: utils.firstRowRange,
          message:
            "Internal error. Try to run the test again. If the issue persists, contact support",
          severity: vscode.DiagnosticSeverity.Error,
          source: "internal_error",
        };
        collectionArray.push(diagnosticInternal);
        collection.set(document.uri, collectionArray);
        break;
    }
    // Store Diagnostic Objects
    context.globalState.update(document.uri.toString(), collectionArray);
  }

  // Run Test Command
  async function runAllTestsCommandHandler() {
    utils.setCWD();
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
    currentYamlDocument = vscode.window.activeTextEditor.document;

    // Get Firm Stored
    let firmId = await setFirmID();
    const firmCredentials = checkFirmCredentials();
    if (!firmCredentials) {
      return;
    }

    outputChannel.appendLine(`Current directory: ${process.cwd()}`);
    // Run Test
    statusBarItemRunTests.setStateRunning();
    let response: types.ResponseObject = await sfToolkit.runTests(
      firmId,
      templateHandle
    );
    statusBarItemRunTests.setStateIdle();
    outputChannel.appendLine(
      `Firm ID: ${firmId}. Template: ${templateHandle}. Response: ${JSON.stringify(
        response
      )}`
    );

    if (!response) {
      // Unhandled errors
      vscode.window.showErrorMessage(
        "Unexpected error: use the CLI to get more information"
      );
      return;
    }

    // Process response and update collection
    processResponse(currentYamlDocument, errorsCollection, response);
  }
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "silverfin-development-toolkit.runAllTests",
      runAllTestsCommandHandler
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

  // Check for changes in current file and compare them with the stored Diagnostic Objects
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(async () => {
      if (!vscode.window.activeTextEditor) {
        return;
      }
      let currentDocument = vscode.window.activeTextEditor.document;
      let storedDiagnostics = await utils.loadStoredDiagnostics(
        currentDocument,
        outputChannel,
        context,
        errorsCollection
      );
      if (!storedDiagnostics) {
        return;
      }
      utils.filterFixedDiagnostics(
        currentDocument,
        outputChannel,
        context,
        errorsCollection,
        storedDiagnostics
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

  const firmHandler = new FirmHandler();
  // Command to set Firm ID via prompt and store it
  context.subscriptions.push(
    vscode.commands.registerCommand(firmHandler.commandName, () => {
      firmHandler.setFirmIdCommand();
    })
  );

  // Command to run the liquid linter
  const linter = new LiquidLinter();
  context.subscriptions.push(
    vscode.commands.registerCommand(linter.commandName, () => {
      linter.verifyLiquidCommand();
    })
  );
  // Command is run when you save a liquid file
  vscode.workspace.onDidSaveTextDocument(() => {
    if (LiquidLinter.isLiquidFileCheck()) {
      linter.verifyLiquidCommand();
    }
  });

  async function runTestWithOptionsCommandHandler() {
    utils.setCWD();
    const allTests = "Run all Liquid Tests";
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
    currentYamlDocument = vscode.window.activeTextEditor.document;

    // Get Firm Stored
    let firmId = await setFirmID();
    const firmCredentials = checkFirmCredentials();
    if (!firmCredentials) {
      return;
    }

    // Identify Test names
    const testNamesandRows = utils.findTestNamesAndRows(currentYamlDocument);
    const testNames = Object.keys(testNamesandRows);
    testNames.unshift(allTests);

    // Select Test to be run
    const testSelected = await vscode.window.showQuickPick(testNames);
    if (!testSelected) {
      return;
    }

    outputChannel.appendLine(`Current directory: ${process.cwd()}`);
    // Run Test
    statusBarItemRunTests.setStateRunning();
    let response: types.ResponseObject;
    if (testSelected === allTests) {
      // Run all tests without HTML
      response = await sfToolkit.runTests(firmId, templateHandle);
    } else {
      // Run specific test with HTML
      response = await sfToolkit.runTests(
        firmId,
        templateHandle,
        testSelected,
        true
      );
    }
    statusBarItemRunTests.setStateIdle();
    outputChannel.appendLine(
      `Firm ID: ${firmId}. Template: ${templateHandle}. Response: ${JSON.stringify(
        response
      )}`
    );

    if (!response) {
      // Unhandled errors
      vscode.window.showErrorMessage(
        "Unexpected error: use the CLI to get more information"
      );
      return;
    }

    // Process response and update collection
    processResponse(currentYamlDocument, errorsCollection, response);

    // HANDLE HTML PANEL
    if (response.status !== "completed") {
      outputChannel.appendLine(`Test failed. No HTML panel created`);
      // Delete HTML panel
      if (htmlPanel) {
        htmlPanel.dispose();
        htmlPanel = undefined;
      }
      return;
    }
    if (testSelected === allTests) {
      outputChannel.appendLine(`All tests run. No HTML panel created`);
      // Delete HTML panel
      if (htmlPanel) {
        htmlPanel.dispose();
        htmlPanel = undefined;
      }
    } else {
      try {
        await sfToolkit.getHTML(
          response.tests[testSelected].html,
          testSelected
        );
        // Open File
        const filePath = sfToolkit.resolveHTMLPath(testSelected);
        const fs = require("fs");
        const fileContent = fs.readFileSync(filePath, "utf8");

        if (!htmlPanel || !htmlPanel?.visible) {
          htmlPanel = vscode.window.createWebviewPanel(
            "htmlWebView",
            "HTML View",
            { viewColumn: vscode.ViewColumn.Two, preserveFocus: true }
          );
        }
        // Display HTML
        htmlPanel.webview.html = fileContent;
      } catch (error) {
        outputChannel.appendLine(`Error while opening HTML:`);
        outputChannel.appendLine(JSON.stringify(error));
        if (htmlPanel) {
          htmlPanel.dispose();
          htmlPanel = undefined;
        } // close panel if open
      }
    }
  }
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "silverfin-development-toolkit.runTestWithOptions",
      runTestWithOptionsCommandHandler
    )
  );
}

export function deactivate() {}
