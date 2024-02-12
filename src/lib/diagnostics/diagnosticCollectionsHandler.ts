import * as vscode from "vscode";
import ExtensionContext from "../extensionContext";
import ExtensionLoggerWrapper from "../outputChannels/extensionLoggerWrapper";
import * as types from "../types";

/**
 * DiagnosticCollectionsHandler Singleton class.
 * This class is responsible for creating each diagnostic collection needed.
 * It is a Singleton class to avoid duplicating collections.
 * It is also responsible for providing the correct reference to each existing collection when requested using getCollection.
 * @example
 * creating an instance:
 *   const collectionsHandler = DiagnosticCollectionsHandler.plug()
 *   const collection = collectionsHandler.getCollection('Mycollection')
 * or without creating an instance:
 *   const collection = DiagnosticCollectionsHandler.getCollection('Mycollection')
 */
export default class DiagnosticCollectionsHandler {
  private static uniqueInstance: DiagnosticCollectionsHandler | null = null;
  private collections: { [name: string]: vscode.DiagnosticCollection };
  private extensionLogger: ExtensionLoggerWrapper = new ExtensionLoggerWrapper(
    "DiagnosticCollectionsHandler"
  );
  constructor() {
    this.collections = {};
    this.registerEvents();
  }

  /**
   * @returns The unique instance of the class.
   * If it does not exist, it will create it.
   */
  public static plug(): DiagnosticCollectionsHandler {
    if (!DiagnosticCollectionsHandler.uniqueInstance) {
      DiagnosticCollectionsHandler.uniqueInstance =
        new DiagnosticCollectionsHandler();
    }
    return DiagnosticCollectionsHandler.uniqueInstance;
  }

  /**
   * Return the existing collection to be used.
   * If it does not exist, create one, and keep it's reference to later use.
   * @param name
   * @returns vscode.DiagnosticCollection
   *  @example
   *   const collection = DiagnosticCollectionsHandler.getCollection('Mycollection')
   */
  public static getCollection(name: string): vscode.DiagnosticCollection {
    const collectionHandler = DiagnosticCollectionsHandler.plug();
    return collectionHandler.getCollection(name);
  }

  /**
   * Return the existing collection to be used.
   * If it does not exist, create one, and keep it's reference to later use.
   * @param name
   * @returns vscode.DiagnosticCollection
   * @example
   *   const collectionsHandler = DiagnosticCollectionsHandler.plug()
   *   const collection = collectionsHandler.getCollection('Mycollection')
   */
  public getCollection(name: string): vscode.DiagnosticCollection {
    let diagnosticCollection = this.collections[name];
    if (!diagnosticCollection) {
      diagnosticCollection = vscode.languages.createDiagnosticCollection(name);
      this.collections[name] = diagnosticCollection;
    }

    return diagnosticCollection;
  }

  /**
   * Load the Diagnostic stored from previous runs.
   * Check file, look for stored data, parse it, create collection.
   * Return the collection as array for further use if needed.
   * @param currentDocument - document to load diagnostics for.
   * @param errorsCollection - DiagnosticCollection where Diagnostics will be loaded in.
   * @returns
   */
  private async loadStoredDiagnostics(
    currentDocument: vscode.TextDocument,
    errorsCollection: vscode.DiagnosticCollection
  ) {
    const extensionContext = ExtensionContext.get();
    // Check if yaml
    if (
      currentDocument.fileName.split(".")[
        currentDocument.fileName.split(".").length - 1
      ] !== "yml"
    ) {
      return;
    }
    // Open Diagnostic Stored in Global State
    let storedDiagnostics: types.StoredDiagnostic[] | undefined =
      await extensionContext.globalState.get(currentDocument.uri.toString());
    this.extensionLogger.log(
      `loaded: ${JSON.stringify(currentDocument.fileName)}`
    );
    if (storedDiagnostics) {
      // Recreate Diagnostic Objects
      let collectionArray: types.DiagnosticObject[] = [];
      for (let diagnosticStored of storedDiagnostics) {
        let diagnosticRecreated = types.diagnosticParser(diagnosticStored);
        collectionArray.push(diagnosticRecreated);
      }
      // Load the Diagnostics
      errorsCollection.set(currentDocument.uri, collectionArray);
      return collectionArray;
    }
  }

  /**
   * Register events to the Extension.
   * When a new file is opened for the first time. Load the Diagnostic stored from previous runs.
   * Also, open the stored diagnostics for the current file if any.
   */
  private registerEvents() {
    const extensionContext = ExtensionContext.get();
    const liquidTestCollection = this.getCollection("LiquidTestCollection");

    // Load Errors stored for open file if any
    if (vscode.window.activeTextEditor) {
      this.loadStoredDiagnostics(
        vscode.window.activeTextEditor.document,
        liquidTestCollection
      );
    }

    // When a new file is opened for the first time. Load the Diagnostic stored from previous runs
    extensionContext.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(async (currentDocument) => {
        this.loadStoredDiagnostics(currentDocument, liquidTestCollection);
      })
    );
  }
}
