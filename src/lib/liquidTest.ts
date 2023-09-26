import { posix } from "path";
import * as vscode from "vscode";
import * as yaml from "yaml";
import * as templateUtils from "../utilities/templateUtils";
import * as utils from "../utilities/utils";
import * as types from "./types";
const sfCliLiquidTestRunner = require("silverfin-cli/lib/liquidTestRunner");

export default class LiquidTest {
  errorsCollection: vscode.DiagnosticCollection;
  output: vscode.OutputChannel;
  context: vscode.ExtensionContext;
  currentYamlDocument!: vscode.TextDocument;
  statusBarItem: any;
  firmHandler: any;
  htmlPanel: vscode.WebviewPanel | undefined;
  firstRowRange: vscode.Range;
  templateHandle: string | false = false;
  firmId: Number | undefined = undefined;
  optionAllTests = "Run all Liquid Tests";
  constructor(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    this.errorsCollection =
      vscode.languages.createDiagnosticCollection(`LiquidTestCollection`);
    this.output = outputChannel;
    this.context = context;
    this.htmlPanel = undefined;
    this.firstRowRange = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 500)
    );
  }

  // Run Test Command
  public async runAllTestsCommand() {
    try {
      const prepared = this.prepareToRun();
      if (!prepared) {
        return;
      }
      // Test Run
      this.setStatusBarRunning();
      let response: types.ResponseObject = await sfCliLiquidTestRunner.runTests(
        this.firmId,
        this.templateHandle
      );
      this.setStatusBarIdle();
      this.outputResponse(response);
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
    } catch (error) {
      this.output.appendLine(`[Liquid Test] Error while running all tests:`);
      this.output.appendLine(JSON.stringify(error));
    }
  }

  public async runTestWithOptionsCommand() {
    try {
      const prepared = this.prepareToRun();
      if (!prepared) {
        return;
      }

      // Identify Test names
      const testNamesandRows = this.findTestNamesAndRows(
        this.currentYamlDocument
      );
      const testNames = Object.keys(testNamesandRows);
      testNames.unshift(this.optionAllTests);
      // Select Test to be run
      let testSelected = await vscode.window.showQuickPick(testNames);
      if (!testSelected) {
        this.output.appendLine(
          "[Liquid Test] Couldn't find any tests to select"
        );
        return;
      }
      let testName = testSelected === this.optionAllTests ? "" : testSelected;
      let htmlRenderMode: types.htmlRenderModes =
        testSelected === this.optionAllTests ? "none" : "input";
      // Test Run
      this.setStatusBarRunning();
      let response: types.ResponseObject = await sfCliLiquidTestRunner.runTests(
        this.firmId,
        this.templateHandle,
        testName,
        false,
        htmlRenderMode
      );
      this.setStatusBarIdle();
      this.outputResponse(response);
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
      if (testSelected !== this.optionAllTests) {
        this.openHtmlPanel(response, testSelected);
      }
    } catch (error) {
      this.output.appendLine(
        `[Liquid Test] Error while running test with options:`
      );
      this.output.appendLine(JSON.stringify(error));
    }
  }

  // Process errors, create Diagnostic Objects with all the needed information
  private createDiagnostics(
    document: vscode.TextDocument,
    testFeedback: types.TestObject
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
        let diagnosticMessage = `["Reconciled status"] Expected: ${
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
          source: `${testName}.expectation.reconciled`, // to identify object in tree
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
        // result or rollforward ?
        let itemType: string;
        Object.keys(testObject.rollforwards).includes(itemName)
          ? (itemType = "rollforward")
          : (itemType = "result");
        // Create diagnostic object
        let diagnostic: types.DiagnosticObject = {
          range: diagnosticRange,
          message: diagnosticMessage,
          severity: vscode.DiagnosticSeverity.Error,
          source: `${testName}.expectation.${itemType}.${itemName}`, // to identify object in tree
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
    let testRun = response.testRun;
    switch (testRun.status) {
      case "completed":
        const errorsPresent = sfCliLiquidTestRunner.checkAllTestsErrorsPresent(
          testRun.tests
        );
        if (errorsPresent) {
          // Errors present after liquid test run
          collectionArray = this.createDiagnostics(document, testRun.tests);
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
          testRun.error_line_number &&
          testRun.hasOwnProperty("error_line_number")
        ) {
          let highlightStartIndex = document.lineAt(
            testRun.error_line_number - 1
          ).firstNonWhitespaceCharacterIndex;
          let highlighEndIndex =
            document.lineAt(testRun.error_line_number - 1).text.split("")
              .length + 1;
          diagnosticRange = new vscode.Range(
            new vscode.Position(
              testRun.error_line_number - 1,
              highlightStartIndex
            ),
            new vscode.Position(testRun.error_line_number - 1, highlighEndIndex)
          );
        } else {
          diagnosticRange = this.firstRowRange;
        }
        let diagnosticMessage;
        if (testRun.error_message) {
          diagnosticMessage = testRun.error_message;
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
          range: this.firstRowRange,
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

  // Return an array with the names of the unit tests and the row where they are located
  private findTestNamesAndRows(document: vscode.TextDocument) {
    const testContent = document.getText();
    const testYAML = yaml.parse(testContent);
    const testNames = Object.keys(testYAML);
    const testRows = testContent.split("\n");
    const indexes: { [index: string]: number } = {};
    testNames.forEach((testName) => {
      let index = testRows.findIndex((element) => element.includes(testName));
      indexes[testName] = index;
    });
    return indexes;
  }

  // Check open file is a Liquid Test
  // Check right folder structure && type YAML
  private async checkFilePath() {
    // File information
    if (!vscode.window.activeTextEditor) {
      return false;
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
      return false;
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
      return false;
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
      return false;
    }
    // Set the right path
    utils.setCWD();

    // Check if the test file stored in the config is the one running
    const configData = await templateUtils.getTemplateConfigData();
    const testPath = posix.join(
      process.cwd(),
      "reconciliation_texts",
      templateHandle,
      configData.test
    );
    if (filePath !== testPath) {
      vscode.window.showErrorMessage(
        "The test file referenced in the config.json is not the one that your trying to run. Check your config.json"
      );
      return false;
    }

    return true;
  }

  private async prepareToRun() {
    utils.setCWD();
    this.output.appendLine(
      `[Liquid Test] Current working directory: ${process.cwd()}`
    );
    // Check right file
    let checksPassed = await this.checkFilePath();
    if (!checksPassed) {
      this.output.appendLine("[Liquid Test] File checks failed");
      return false;
    }
    // Get template handle
    this.templateHandle = await templateUtils.getTemplateHandle();
    if (!this.templateHandle) {
      this.output.appendLine("[Liquid Test] Template handle not found");
      return false;
    }
    // Check active tab and get document
    if (!vscode.window.activeTextEditor) {
      this.output.appendLine(`[Liquid Test] No active text editor found`);
      return false;
    }
    this.currentYamlDocument = vscode.window.activeTextEditor.document;
    // Get Firm
    if (!this.firmHandler) {
      this.output.appendLine("[Liquid Test] Firm handler not found");
      return false;
    }
    this.firmId = await this.firmHandler.setFirmID();
    // Check firm credentials
    const firmTokensPresent =
      await this.firmHandler.getAuthorizedDefaultFirmId();
    if (!firmTokensPresent) {
      this.output.appendLine("[Liquid Test] Firm credentials not found");
      return false;
    }
  }

  private async openHtmlPanel(
    response: types.ResponseObject,
    testSelected: string
  ) {
    if (this.htmlPanel) {
      this.htmlPanel.dispose();
      this.htmlPanel = undefined;
    }
    try {
      await sfCliLiquidTestRunner.getHTML(
        response.previewRun.tests[testSelected].html_input,
        testSelected,
        false,
        "html_input"
      );
      // Open File
      const filePath = sfCliLiquidTestRunner.resolveHTMLPath(
        `${testSelected}_html_input`
      );
      const fs = require("fs");
      const fileContent = fs.readFileSync(filePath, "utf8");
      if (!this.htmlPanel) {
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
      // close panel if open
      if (this.htmlPanel) {
        this.htmlPanel.dispose();
        this.htmlPanel = undefined;
      }
    }
  }

  private setStatusBarRunning() {
    if (this.statusBarItem) {
      this.statusBarItem.setStateRunning();
    }
  }
  private setStatusBarIdle() {
    if (this.statusBarItem) {
      this.statusBarItem.setStateIdle();
    }
  }

  private outputResponse(response: types.ResponseObject) {
    this.output.appendLine(
      `[Liquid Test] Firm ID: ${this.firmId}. Template: ${
        this.templateHandle
      }. ${JSON.stringify({ response })}`
    );
  }
}
