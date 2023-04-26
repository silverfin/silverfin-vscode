import * as vscode from "vscode";
import * as types from "./types";
import * as utils from "./utils";
const sfToolkit = require("sf_toolkit");

export default class LiquidTest {
  errorsCollection: vscode.DiagnosticCollection;
  output: vscode.OutputChannel;
  context: vscode.ExtensionContext;
  currentYamlDocument: vscode.TextDocument | undefined;
  statusBarItem: any;
  firmHandler: any;
  htmlPanel: vscode.WebviewPanel | undefined;
  constructor(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    this.errorsCollection =
      vscode.languages.createDiagnosticCollection(`LiquidTestCollection`);
    this.output = outputChannel;
    this.context = context;
    this.currentYamlDocument = undefined;
    this.htmlPanel = undefined;
  }

  // Process errors, create Diagnostic Objects with all the needed information
  private createDiagnostics(
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
  private processResponse(
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
          collectionArray = this.createDiagnostics(document, response.tests);
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
        if (this.statusBarItem) {
          this.statusBarItem.setStateInternalError();
        }
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
    this.context.globalState.update(document.uri.toString(), collectionArray);
  }

  // Run Test Command
  public async runAllTestsCommand() {
    utils.setCWD();
    this.output.appendLine(`Current working directory: ${process.cwd()}`);
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
    this.currentYamlDocument = vscode.window.activeTextEditor.document;

    // Get Firm
    if (this.firmHandler) {
      return;
    }
    let firmId = await this.firmHandler.setFirmID();
    const firmCredentials = this.firmHandler.checkFirmCredentials();
    if (!firmCredentials) {
      return;
    }

    // Run Test
    if (this.statusBarItem) {
      this.statusBarItem.setStateRunning();
    }
    let response: types.ResponseObject = await sfToolkit.runTests(
      firmId,
      templateHandle
    );
    if (this.statusBarItem) {
      this.statusBarItem.setStateIdle();
    }
    this.output.appendLine(
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
    this.processResponse(
      this.currentYamlDocument,
      this.errorsCollection,
      response
    );
  }

  public async runTestWithOptionsCommand() {
    utils.setCWD();
    this.output.appendLine(`Current working directory: ${process.cwd()}`);
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
    this.currentYamlDocument = vscode.window.activeTextEditor.document;

    // Get Firm Stored
    let firmId = await this.firmHandler.setFirmID();
    const firmCredentials = this.firmHandler.checkFirmCredentials();
    if (!firmCredentials) {
      return;
    }

    // Identify Test names
    const testNamesandRows = utils.findTestNamesAndRows(
      this.currentYamlDocument
    );
    const testNames = Object.keys(testNamesandRows);
    testNames.unshift(allTests);

    // Select Test to be run
    const testSelected = await vscode.window.showQuickPick(testNames);
    if (!testSelected) {
      return;
    }

    // Run Test
    if (this.statusBarItem) {
      this.statusBarItem.setStateRunning();
    }
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
    if (this.statusBarItem) {
      this.statusBarItem.setStateIdle();
    }
    this.output.appendLine(
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
    this.processResponse(
      this.currentYamlDocument,
      this.errorsCollection,
      response
    );

    // HANDLE HTML PANEL
    if (response.status !== "completed") {
      this.output.appendLine(`Test failed. No HTML panel created`);
      // Delete HTML panel
      if (this.htmlPanel) {
        this.htmlPanel.dispose();
        this.htmlPanel = undefined;
      }
      return;
    }
    if (testSelected === allTests) {
      this.output.appendLine(`All tests run. No HTML panel created`);
      // Delete HTML panel
      if (this.htmlPanel) {
        this.htmlPanel.dispose();
        this.htmlPanel = undefined;
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

        if (!this.htmlPanel || !this.htmlPanel?.visible) {
          this.htmlPanel = vscode.window.createWebviewPanel(
            "htmlWebView",
            "HTML View",
            { viewColumn: vscode.ViewColumn.Two, preserveFocus: true }
          );
        }
        // Display HTML
        this.htmlPanel.webview.html = fileContent;
      } catch (error) {
        this.output.appendLine(`Error while opening HTML:`);
        this.output.appendLine(JSON.stringify(error));
        if (this.htmlPanel) {
          this.htmlPanel.dispose();
          this.htmlPanel = undefined;
        } // close panel if open
      }
    }
  }
}
