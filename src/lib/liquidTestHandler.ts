import { posix } from "path";
import * as vscode from "vscode";
import * as yaml from "yaml";
import * as templateUtils from "../utilities/templateUtils";
import * as utils from "../utilities/utils";
import DiagnosticCollectionsHandler from "./diagnostics/diagnosticCollectionsHandler";
import ExtensionContext from "./extensionContext";
import FirmHandler from "./firmHandler";
import ExtensionLoggerWrapper from "./outputChannels/extensionLoggerWrapper";
import SilverfinToolkit from "./silverfinToolkit";
import StatusBarItem from "./statusBar/statusBarItem";
import * as types from "./types";

export default class LiquidTestHandler {
  private firmHandler: FirmHandler = FirmHandler.plug();
  private statusBarItem: StatusBarItem = StatusBarItem.plug();
  private extensionLogger: ExtensionLoggerWrapper = new ExtensionLoggerWrapper(
    "LiquidTestHandler"
  );
  private errorsCollection: vscode.DiagnosticCollection;
  yamlDocument!: vscode.TextDocument;
  htmlPanel: vscode.WebviewPanel | undefined;
  firstRowRange: vscode.Range;
  templateHandle: string | false = false;
  firmId: Number | undefined = undefined;
  optionAllTestsMsg = "Run all Liquid Tests (no html)";

  constructor() {
    this.errorsCollection =
      DiagnosticCollectionsHandler.getCollection(`LiquidTestCollection`);
    this.htmlPanel = undefined;
    this.firstRowRange = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 500)
    );
    this.registerEvents();
  }

  public async runAllTestsCommand() {
    try {
      const prepared = this.prepareToRun();
      if (!prepared || !this.templateHandle) {
        return;
      }
      this.runTest(this.templateHandle, "", false, "none");
    } catch (error) {
      this.outputLog(`Error while running command all tests`, { error });
    }
  }

  public async runTestWithOptionsCommand(mode: types.htmlOpenModes) {
    try {
      const prepared = this.prepareToRun();
      if (!prepared || !this.templateHandle) {
        return;
      }
      const testName = await this.selectTest();
      if (testName === false) {
        return;
      }
      const htmlRenderMode: types.htmlRenderModes =
        testName === "" ? "none" : mode;
      this.runTest(this.templateHandle, testName, false, htmlRenderMode);
    } catch (error) {
      this.outputLog(`Error while running command test with option`, { error });
    }
  }

  /**
   * Run test process. Update diagnostic collection if needed. Open HTML panel if needed. Handle Status Bar status.
   * @param templateHandle Template Handle
   * @param testName Test Name (empty string for all tests)
   * @param previewOnly If true, the diagnostic collection won't be updated
   * @param htmlRenderMode "all" | "input" | "preview" | "none"
   * */
  public async runTest(
    templateHandle: string,
    testName: string,
    previewOnly: boolean,
    htmlRenderMode: types.htmlRenderModes
  ) {
    try {
      this.setStatusBarRunning();
      this.firmId = await this.firmHandler.setFirmID();
      this.templateHandle = templateHandle;
      this.outputLog("New test run", {
        templateHandle,
        testName,
        previewOnly,
        htmlRenderMode
      });
      const templateType = "reconciliationText"; // TODO: temporal fix until account templates are supported
      // Test Run
      let response: types.ResponseObject =
        await SilverfinToolkit.liquidTestRunner.runTests(
          this.firmId,
          templateType,
          templateHandle,
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
      // Process response and update collection (only when we don't want html to be rendered)
      if (!previewOnly) {
        const yamlDocument = await this.openYamlDocument();
        if (yamlDocument) {
          this.processResponse(yamlDocument, this.errorsCollection, response);
        } else {
          this.extensionLogger.log(
            `Error while opening yaml file to store results`
          );
        }
      }
      // HANDLE HTML PANEL
      if (htmlRenderMode === "none") {
        this.closeHtmlPanel();
      } else if (htmlRenderMode === "all") {
        // At the moment, we only handle one tab at a time
        this.closeHtmlPanel();
      } else {
        this.openHtmlPanel(response, testName, htmlRenderMode);
      }
    } catch (error) {
      this.extensionLogger.log(
        `Error while running a test:${JSON.stringify(error)}`
      );
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
        ...testObject.rollforwards
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
          code: testName
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
          code: testName
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
        const errorsPresent =
          SilverfinToolkit.liquidTestRunner.checkAllTestsErrorsPresent(
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
          source: "error_message"
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
          source: "internal_error"
        };
        collectionArray.push(diagnosticInternal);
        collection.set(document.uri, collectionArray);
        break;
    }
    // Store Diagnostic Objects
    const extContenxt = ExtensionContext.get();
    extContenxt.globalState.update(document.uri.toString(), collectionArray);
  }

  // Return an array with the names of the tests associated to the current template
  // It should be identified from liquid, yaml, config files (any related file of the template)
  public async listTestNames() {
    const yamlDocument = await this.openYamlDocument();
    if (!yamlDocument) {
      return false;
    }
    const testNamesAndRows = this.findTestNamesAndRows(yamlDocument) || {};
    const testNames = Object.keys(testNamesAndRows);
    return testNames;
  }

  private async openYamlDocument() {
    const yamlPath = await templateUtils.getTemplateLiquidTestsPath();
    if (!yamlPath) {
      return false;
    }
    const yamlUri = vscode.Uri.file(yamlPath);
    return await vscode.workspace.openTextDocument(yamlUri);
  }

  private parseYaml(testContent: string) {
    try {
      this.extensionLogger.log("Parsing YAML file...");
      // maxAliasCount is by default 100, but with large YAMLs we could have more than 100 aliases, if we pass 10000, the YAML parsing will start failing (relatively silently). This option exists to prevent exponential entity expansion attacks by limiting data aliasing; set to -1 to disable checks; 0 disallows all alias nodes.
      const options = { maxAliasCount: 10000 };
      const parsedYaml = yaml.parse(testContent, options);
      this.extensionLogger.log("Parsing YAML file succeeded");

      return parsedYaml;
    } catch (err) {
      this.extensionLogger.log("Parsing YAML file failed");
      this.extensionLogger.log(
        "Errors occurred while parsing YAML",
        JSON.stringify(err)
      );

      return {};
    }
  }

  // Return an array with the names of the unit tests and the row where they are located
  private findTestNamesAndRows(document: vscode.TextDocument) {
    const indexes: { [index: string]: number } = {};
    const testContent = document.getText();
    const testYAML = this.parseYaml(testContent) || {};

    if (!testYAML) {
      return indexes;
    }

    const testNames = Object.keys(testYAML);
    const testRows = testContent.split("\n");
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
      path: configPath
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
    this.extensionLogger.log(`Current working directory: ${process.cwd()}`);
    // Check right file
    let checksPassed = await this.checkFilePath();
    if (!checksPassed) {
      this.extensionLogger.log("File checks failed");
      return false;
    }
    // Get template handle
    this.templateHandle = await templateUtils.getTemplateHandle();
    if (!this.templateHandle) {
      this.extensionLogger.log("Template handle not found");
      return false;
    }
    // Check active tab and get document
    if (!vscode.window.activeTextEditor) {
      this.extensionLogger.log(`No active text editor found`);
      return false;
    }
    this.yamlDocument = vscode.window.activeTextEditor.document;
    // Get Firm
    if (!this.firmHandler) {
      this.extensionLogger.log("Firm handler not found");
      return false;
    }
    this.firmId = await this.firmHandler.setFirmID();
    // Check firm credentials
    const firmTokensPresent =
      await this.firmHandler.getAuthorizedDefaultFirmId();
    if (!firmTokensPresent) {
      this.extensionLogger.log("Firm credentials not found");
      return false;
    }
  }

  private async openHtmlPanel(
    response: types.ResponseObject,
    testSelected: string,
    htmlRenderMode: types.htmlOpenModes = "input"
  ) {
    try {
      this.closeHtmlPanel();
      let htmlType =
        `html_${htmlRenderMode}` as keyof (typeof response.previewRun.tests)[typeof testSelected];
      await SilverfinToolkit.liquidTestRunner.getHTML(
        response.previewRun.tests[testSelected][htmlType],
        testSelected,
        false,
        htmlType
      );
      // Open File
      const filePath = SilverfinToolkit.liquidTestRunner.resolveHTMLPath(
        `${testSelected}_${htmlType}`
      );
      const fs = require("fs");
      const fileContent = fs.readFileSync(filePath, "utf8");
      if (!this.htmlPanel) {
        this.htmlPanel = vscode.window.createWebviewPanel(
          "htmlWebView",
          `HTML View (${htmlRenderMode})`,
          { viewColumn: vscode.ViewColumn.Two, preserveFocus: true }
        );
      }
      // Display HTML
      this.htmlPanel.webview.html = fileContent;
    } catch (error) {
      this.extensionLogger.log(
        `Error while opening HTML: ${JSON.stringify(error)}`
      );
      this.closeHtmlPanel();
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
    this.extensionLogger.log(
      `Firm ID: ${this.firmId}. Template: ${this.templateHandle}`,
      JSON.stringify({ response })
    );
  }

  private outputLog(message: string, object: object) {
    this.extensionLogger.log(`${message}.`, JSON.stringify({ object }));
  }

  private closeHtmlPanel() {
    if (this.htmlPanel) {
      this.htmlPanel.dispose();
      this.htmlPanel = undefined;
    }
  }

  /**
   * Open QuickPick to select the test to be run
   * @returns Test Name or false if no test is selected
   */
  private async selectTest() {
    // Identify Test names
    const testNamesandRows = this.findTestNamesAndRows(this.yamlDocument);
    const testNames = Object.keys(testNamesandRows);
    testNames.unshift(this.optionAllTestsMsg);
    // Select Test to be run
    let testSelected = await vscode.window.showQuickPick(testNames);
    if (!testSelected) {
      this.extensionLogger.log("Couldn't find any tests to select");
      return false;
    }
    let testName = testSelected === this.optionAllTestsMsg ? "" : testSelected;
    return testName;
  }

  /**
   * Register all the events to the Extension
   * Commands:
   * - Run all tests
   * - Run test with options (input html)
   * - Run test with options (preview html)
   */
  private registerEvents() {
    const extensionContext = ExtensionContext.get();
    // Command to run all tests
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(
        "silverfin-development-toolkit.runAllTests",
        () => {
          this.runAllTestsCommand();
        }
      )
    );

    // Command to run specific test (with html input)
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(
        "silverfin-development-toolkit.runTestWithOptionsInputHtml",
        () => {
          this.runTestWithOptionsCommand("input");
        }
      )
    );

    // Command to run specific test (with html preview)
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(
        "silverfin-development-toolkit.runTestWithOptionsPreviewHtml",
        () => {
          this.runTestWithOptionsCommand("preview");
        }
      )
    );

    // Command to clean Diagnostic Collection of current file
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(
        "silverfin-development-toolkit.clearCurrentDiagnosticCollection",
        () => {
          if (!vscode.window.activeTextEditor) {
            return;
          }
          this.errorsCollection.set(
            vscode.window.activeTextEditor.document.uri,
            []
          );
        }
      )
    );
  }
}
