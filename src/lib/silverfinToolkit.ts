import ExtensionLoggerWrapper from "./outputChannels/extensionLoggerWrapper";

const { firmCredentials } = require("silverfin-cli/lib/api/firmCredentials");
const apiUtils = require("silverfin-cli/lib/utils/apiUtils");
const api = require("silverfin-cli/lib/api/sfApi");
const liquidTestRunner = require("silverfin-cli/lib/liquidTestRunner");
const toolkit = require("silverfin-cli");
const fsUtils = require("silverfin-cli/lib/utils/fsUtils");

/** Class Wrapper around silverfin-cli
 * This could be considered a temporary workaround until the silverfin-cli cover some of the functionality that's needed.
 * 1 - JSDocs for the silverfin-cli
 * 2 - Better organization of what can be accessed from the silverfin-cli
 * 3 - Better error handling (properly return errors instead of just logging them to the console)
 */

export default class SilverfinToolkit {
  public static firmCredentials = firmCredentials;
  public static apiUtils = apiUtils;
  public static api = api;
  public static liquidTestRunner = liquidTestRunner;
  public static toolkit = toolkit;
  public static fsUtils = fsUtils;
  private extensionLogger: ExtensionLoggerWrapper = new ExtensionLoggerWrapper(
    "SilverfinToolkit"
  );
  constructor() {}

  public static commandMapper: { [index: string]: { [index: string]: any } } = {
    create: {
      reconciliationText: SilverfinToolkit.toolkit.newReconciliation,
      sharedPart: SilverfinToolkit.toolkit.newSharedPart,
      accountTemplate: SilverfinToolkit.toolkit.newAccountTemplate,
      exportFile: SilverfinToolkit.toolkit.newExportFile
    },
    import: {
      reconciliationText: SilverfinToolkit.toolkit.fetchReconciliationByHandle,
      sharedPart: SilverfinToolkit.toolkit.fetchSharedPartByName,
      accountTemplate: SilverfinToolkit.toolkit.fetchAccountTemplateByName,
      exportFile: SilverfinToolkit.toolkit.fetchExportFileByName
    },
    update: {
      reconciliationText:
        SilverfinToolkit.toolkit.publishReconciliationByHandle,
      sharedPart: SilverfinToolkit.toolkit.publishSharedPartByName,
      accountTemplate: SilverfinToolkit.toolkit.publishAccountTemplateByName,
      exportFile: SilverfinToolkit.toolkit.publishExportFileByName
    }
  };

  public static templateTypeMapper: { [index: string]: string } = {
    reconciliationText: "Reconciliation Text",
    sharedPart: "Shared Part",
    accountTemplate: "Account Template",
    exportFile: "Export File"
  };

  public static commandLabelMapper: { [index: string]: string } = {
    create: "Create",
    import: "Import",
    update: "Update",
    getTemplateId: "Get template id",
    addSharedPart: "Add Shared Part",
    removeSharedPart: "Remove Shared Part"
  };

  // THIS WON'T WORK UNTIL SILVERFIN-CLI IS UPDATED
  // it does not return any value, it just logs to the console

  /**
   * Run a command from the silverfin-cli. This is a wrapper around the silverfin-cli commands.
   * It will log the result of the command to the extension output channel.
   * It will also log any errors to the extension output channel.
   * It will catch errors and return null if there is an error.
   * @param command - The command from silverfin-cli to run
   * @param args - The arguments to pass to the command
   * @returns - The result of the command
   */
  public async callCommand(command: FunctionType, ...args: string[]) {
    try {
      const result = await command(...args);
      this.extensionLogger.log("Command result", result);
      return result;
    } catch (error) {
      this.extensionLogger.log("Error running command", error);
      return null;
    }
  }
}

type FunctionType = (...args: string[]) => any;
