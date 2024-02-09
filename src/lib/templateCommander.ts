const sfCli = require("silverfin-cli");
const sfCliFsUtils = require("silverfin-cli/lib/utils/fsUtils");
const { firmCredentials } = require("silverfin-cli/lib/api/firmCredentials");
import * as vscode from "vscode";
import * as utils from "../utilities/utils";

/**
 * A class to handle the commands to run on the templates, interacting with the Silverfin API (using the `silverfin-cli` package).
 * Registers the command `silverfin-development-toolkit.templateCommandsInBulk` to run the `runCommandOnTemplatesInBulk` method.
 */
export class TemplateCommander {
  output: vscode.OutputChannel;
  outputUser: vscode.OutputChannel;
  firmHandler: any;
  firmId: Number | undefined = undefined;
  vscodeContext: vscode.ExtensionContext;

  constructor(
    firmHandler: any,
    outputChannelLog: vscode.OutputChannel,
    outputChannelUser: vscode.OutputChannel,
    vscodeContext: vscode.ExtensionContext
  ) {
    this.firmHandler = firmHandler;
    this.output = outputChannelLog;
    this.outputUser = outputChannelUser;
    this.vscodeContext = vscodeContext;
    this.registerCommands();
  }

  /**
   * A VSCode command that open a Quick Pick panel to select a command to run.
   * It works in three steps. First you select the command to run (`import`, `create`, `update`, `get-id`).
   * Then you select the templates to run the command on. Finally, you select the firm to run the command on.
   * The command is then run and the output is logged to the output channel.
   */
  private async runCommandOnTemplatesInBulk() {
    const check = utils.setCWD();
    if (!check) {
      return;
    }

    const selectedOption = await this.selectCommand();
    if (!selectedOption) {
      vscode.window.showErrorMessage(`No command option was selected`);
      return;
    }

    const selectedTemplates = await this.selectTemplates();
    if (selectedTemplates?.length === 0 || !selectedTemplates) {
      vscode.window.showErrorMessage(`No template was selected`);
      return;
    }

    const selectedFirm = await this.selectFirm();
    if (selectedFirm?.length !== 1 || !selectedFirm) {
      vscode.window.showErrorMessage(`One and only one firm must be selected`);
      return;
    }

    // TODO: Run the specific command to each template individually. Log the output to the output channel for Users.
    await this.runEachSilverfinAction(
      selectedOption.label,
      selectedTemplates,
      Number(selectedFirm[0].label)
    );
  }

  /**
   * Show a QuickPick panel to select a command to run.
   * The options are `Create`, `Import`, `Update` and `Get template id`.
   * @returns A QuickPickItem with the selected command
   */
  private async selectCommand() {
    const optionCreate: vscode.QuickPickItem = {
      label: this.commandLabelMapper.create,
      description:
        "Create template in the Platform using code from this repository",
    };
    const optionImport: vscode.QuickPickItem = {
      label: this.commandLabelMapper.import,
      description: "Import template's code from Platform into this repository",
    };
    const optionUpdate: vscode.QuickPickItem = {
      label: this.commandLabelMapper.update,
      description:
        "Update template's code in the Platform using code from this repository",
    };
    const optionGetId: vscode.QuickPickItem = {
      label: this.commandLabelMapper.getTemplateId,
      description: "Get the template id from the Platform",
    };
    const optionsToSelect: vscode.QuickPickItem[] = [
      optionCreate,
      optionImport,
      optionUpdate,
      optionGetId,
    ];

    const selectedOption = await vscode.window.showQuickPick(optionsToSelect, {
      placeHolder: "Which command do you want to run?",
      title: "Select a command",
      canPickMany: false,
      matchOnDescription: true,
    });

    this.outputLog("Selected command", selectedOption);

    return selectedOption;
  }

  /**
   * Show a QuickPick panel to select the templates to run the command on.
   * The options are all the templates in the repository.
   * @returns A QuickPickItem with the selected templates
   */
  private async selectTemplates() {
    const reconciliations = await sfCliFsUtils.getAllTemplatesOfAType(
      "reconciliationText"
    );
    const sharedParts = await sfCliFsUtils.getAllTemplatesOfAType("sharedPart");
    const accountTemplates = await sfCliFsUtils.getAllTemplatesOfAType(
      "accountTemplate"
    );
    const exportFiles = await sfCliFsUtils.getAllTemplatesOfAType("exportFile");

    const optionsToSelect: vscode.QuickPickItem[] = [];

    for (const template of reconciliations) {
      optionsToSelect.push({
        label: template,
        description: this.templateTypeMapper.reconciliationText,
      });
    }
    for (const template of sharedParts) {
      optionsToSelect.push({
        label: template,
        description: this.templateTypeMapper.sharedPart,
      });
    }
    for (const template of accountTemplates) {
      optionsToSelect.push({
        label: template,
        description: this.templateTypeMapper.accountTemplate,
      });
    }
    for (const template of exportFiles) {
      optionsToSelect.push({
        label: template,
        description: this.templateTypeMapper.exportFile,
      });
    }

    const selectedOption = await vscode.window.showQuickPick(optionsToSelect, {
      placeHolder: "Which template/s do you want to use?",
      title: "Select templates",
      canPickMany: true,
      matchOnDescription: true,
    });

    this.outputLog("Selected template/s", selectedOption);

    return selectedOption;
  }

  /**
   * Show a QuickPick panel to select the firm to run the command on.
   * The options are all the firms the user has access to.
   * The default value is the current firm.
   * @returns A QuickPickItem with the selected firm
   */
  private async selectFirm() {
    const firmData = await firmCredentials.listAuthorizedFirms(); // [[firmId, firmName]...]
    const defaultFirm = await firmCredentials.getDefaultFirmId();
    const optionsToSelect: vscode.QuickPickItem[] = [];

    for (const firm of firmData) {
      let alreadyPicked = false;
      if (firm[0].toString() === defaultFirm.toString()) {
        alreadyPicked = true;
      }
      optionsToSelect.push({
        label: firm[0],
        description: firm[1],
        picked: alreadyPicked,
      });
    }

    const selectedOption = await vscode.window.showQuickPick(optionsToSelect, {
      placeHolder: "Which firm do you want to use?",
      title: "Select a firm",
      canPickMany: true,
      matchOnDescription: true,
    });

    this.outputLog("Selected firm", selectedOption);

    return selectedOption;
  }

  private async runEachSilverfinAction(
    commandChoiceLabel: string,
    templates: vscode.QuickPickItem[],
    firmId: Number
  ) {
    this.outputLog("Start command run", {
      commandChoiceLabel,
      templates,
      firmId,
    });

    for (const template of templates) {
      const templateType = Object.keys(this.templateTypeMapper).find(
        (key) => this.templateTypeMapper[key] === template.description
      );
      const templateHandle = template.label;
      const commandType = Object.keys(this.commandLabelMapper).find(
        (key) => this.commandLabelMapper[key] === commandChoiceLabel
      );

      if (!templateType || !templateHandle || !commandType) {
        this.outputLog("Could not run command. Parameter missing", {
          templateType,
          templateHandle,
          commandType,
        });
        return false;
      }

      let commandToRun = "";
      if (commandType === "getTemplateId") {
        commandToRun = "sfCli.getTemplateId";
      } else {
        commandToRun = this.commandMapper[commandType][templateType];
      }

      this.outputLog("Running command", {
        commandToRun,
        templateType,
        templateHandle,
      });
    }
  }

  private outputLog(message: string, object: any) {
    this.output.appendLine(
      `[Template Commands] ${message}. ${JSON.stringify({ object })}`
    );
  }

  /**
   * Register the command `silverfin-development-toolkit.templateCommandsInBulk` to run the `runCommandOnTemplatesInBulk` method.
   * The command is available in the Command Palette.
   * @returns void
   */
  private registerCommands() {
    this.vscodeContext.subscriptions.push(
      vscode.commands.registerCommand(
        "silverfin-development-toolkit.templateCommandsInBulk",
        () => {
          this.runCommandOnTemplatesInBulk();
        }
      )
    );
  }

  commandMapper: { [index: string]: { [index: string]: any } } = {
    create: {
      reconciliationText: "sfCli.newReconciliation",
      sharedPart: "sfCli.newSharedPart",
      accountTemplate: "sfCli.newAccountTemplate",
      exportFile: "sfCli.newExportFile",
    },
    import: {
      reconciliationText: "sfCli.fetchReconciliationByHandle",
      sharedPart: "sfCli.fetchSharedPartByName",
      accountTemplate: "sfCli.fetchAccountTemplateByName",
      exportFile: "sfCli.fetchExportFileByName",
    },
    update: {
      reconciliationText: "sfCli.publishReconciliationByHandle",
      sharedPart: "sfCli.publishSharedPartByName",
      accountTemplate: "sfCli.publishAccountTemplateByName",
      exportFile: "sfCli.publishExportFileByName",
    },
  };

  templateTypeMapper: { [index: string]: string } = {
    reconciliationText: "Reconciliation Text",
    sharedPart: "Shared Part",
    accountTemplate: "Account Template",
    exportFile: "Export File",
  };

  commandLabelMapper: { [index: string]: string } = {
    create: "Create",
    import: "Import",
    update: "Update",
    getTemplateId: "Get template id",
  };
}
