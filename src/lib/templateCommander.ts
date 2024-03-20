import * as vscode from "vscode";
import * as utils from "../utilities/utils";
import ExtensionContext from "./extensionContext";
import ExtensionLoggerWrapper from "./outputChannels/extensionLoggerWrapper";
import UserLogger from "./outputChannels/userLogger";
import SilverfinToolkit from "./silverfinToolkit";

/**
 * A class to handle the commands to run on the templates, interacting with the Silverfin API (using the `silverfin-cli` package).
 * Registers the command `silverfin-development-toolkit.templateCommandsInBulk` to run the `runCommandOnTemplatesInBulk` method.
 */
export default class TemplateCommander {
  private extensionLogger: ExtensionLoggerWrapper = new ExtensionLoggerWrapper(
    "TemplateCommander"
  );
  private userLogger: UserLogger = UserLogger.plug();
  private commandMapper: { [index: string]: string } = {
    create: "silverfin-development-toolkit.createTemplatesInBulk",
    import: "silverfin-development-toolkit.importTemplatesInBulk",
    update: "silverfin-development-toolkit.updateTemplatesInBulk",
    getTemplateId: "silverfin-development-toolkit.getTemplatesIdInBulk",
    add: "silverfin-development-toolkit.addSharedPartInBulk",
    remove: "silverfin-development-toolkit.removeSharedPartInBulk",
    commandSelector: "silverfin-development-toolkit.runCommandInBulk"
  };
  constructor() {
    this.registerEvents();
  }

  /**
   * A VSCode command that open a Quick Pick panel to select templates and firm to run a command on.
   * First, you select the templates to run the command on. Finally, you select the firm to run the command on.
   * The command is then run and the output is logged to the user channel.
   */
  private async runCommandOnTemplatesInBulk(commandName: string) {
    const check = utils.setCWD();
    if (!check) {
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
    const firmId = Number(selectedFirm[0].label);

    await this.performEachTemplateCall(firmId, commandName, selectedTemplates);
  }

  /**
   * A VSCode command that open a Quick Pick panel to select shared parts, templates and firm to run a command on.
   * First, you select the shared parts to run the command on. Then, you select the templates where the shared parts should be applied. Finally, you select the firm to run the command on.
   * The command is then run and the output is logged to the user channel.
   */
  private async runCommandOnSharedPartsInBulk(commandName: string) {
    const check = utils.setCWD();
    if (!check) {
      return;
    }

    const selectedSharedParts = await this.selectTemplates(true, false);
    if (selectedSharedParts?.length === 0 || !selectedSharedParts) {
      vscode.window.showErrorMessage(`No shared part was selected`);
      return;
    }

    const selectedTemplates = await this.selectTemplates(false, true);
    if (selectedTemplates?.length === 0 || !selectedTemplates) {
      vscode.window.showErrorMessage(`No template was selected`);
      return;
    }

    const selectedFirm = await this.selectFirm();
    if (selectedFirm?.length !== 1 || !selectedFirm) {
      vscode.window.showErrorMessage(`One and only one firm must be selected`);
      return;
    }
    const firmId = Number(selectedFirm[0].label);

    await this.performEachSharedPartCall(
      firmId,
      commandName,
      selectedSharedParts,
      selectedTemplates
    );
  }

  /**
   * Show a QuickPick panel to select a command to run.
   * The options are `Create`, `Import`, `Update` and `Get template id`.
   * @returns A QuickPickItem with the selected command
   */
  private async selectCommand() {
    const optionCreate: vscode.QuickPickItem = {
      label: SilverfinToolkit.commandLabelMapper.create,
      description:
        "Create template in the Platform using code from this repository"
    };
    const optionImport: vscode.QuickPickItem = {
      label: SilverfinToolkit.commandLabelMapper.import,
      description:
        "Import template's code from the Platform. Select templates from this repository (existing files will be overwritten)"
    };
    const optionUpdate: vscode.QuickPickItem = {
      label: SilverfinToolkit.commandLabelMapper.update,
      description:
        "Update template's code in the Platform using code from this repository"
    };
    const optionGetId: vscode.QuickPickItem = {
      label: SilverfinToolkit.commandLabelMapper.getTemplateId,
      description: "Get the template id from the Platform"
    };
    const optionAddSharedPart: vscode.QuickPickItem = {
      label: SilverfinToolkit.commandLabelMapper.add,
      description: "Add a shared part to a template"
    };
    const optionRemoveSharedPart: vscode.QuickPickItem = {
      label: SilverfinToolkit.commandLabelMapper.remove,
      description: "Remove a shared part from a template"
    };
    const optionsToSelect: vscode.QuickPickItem[] = [
      optionCreate,
      optionImport,
      optionUpdate,
      optionAddSharedPart,
      optionRemoveSharedPart,
      optionGetId
    ];

    const selectedOption = await vscode.window.showQuickPick(optionsToSelect, {
      placeHolder: "Which command do you want to run?",
      title: "Select a command",
      canPickMany: false,
      matchOnDescription: true
    });

    if (!selectedOption) {
      return;
    }

    const commandType = Object.keys(SilverfinToolkit.commandLabelMapper).find(
      (key) => SilverfinToolkit.commandLabelMapper[key] === selectedOption.label
    );

    this.extensionLogger.log("Selected command", commandType);

    if (!commandType) {
      vscode.window.showErrorMessage("Command not found");
      return selectedOption;
    }

    vscode.commands.executeCommand(this.commandMapper[commandType]);
  }

  /**
   * Show a QuickPick panel to select the templates to run the command on.
   * The options are all the templates in the repository.
   * @param includeSharedParts Whether to include shared parts in the options
   * @param includeTemplates Whether to include templates in the options (reconciliationText, accountTemplate, exportFile)
   * @returns A `QuickPickItem` with the selected templates
   */
  private async selectTemplates(
    includeSharedParts: boolean = true,
    includeTemplates: boolean = true
  ) {
    const optionsToSelect: vscode.QuickPickItem[] = [];
    if (includeSharedParts) {
      const sharedParts = await SilverfinToolkit.fsUtils.getAllTemplatesOfAType(
        "sharedPart"
      );
      for (const template of sharedParts) {
        optionsToSelect.push({
          label: template,
          description: SilverfinToolkit.templateTypeMapper.sharedPart
        });
      }
    }
    if (includeTemplates) {
      const reconciliations =
        await SilverfinToolkit.fsUtils.getAllTemplatesOfAType(
          "reconciliationText"
        );
      for (const template of reconciliations) {
        optionsToSelect.push({
          label: template,
          description: SilverfinToolkit.templateTypeMapper.reconciliationText
        });
      }
      const accountTemplates =
        await SilverfinToolkit.fsUtils.getAllTemplatesOfAType(
          "accountTemplate"
        );
      for (const template of accountTemplates) {
        optionsToSelect.push({
          label: template,
          description: SilverfinToolkit.templateTypeMapper.accountTemplate
        });
      }
      const exportFiles = await SilverfinToolkit.fsUtils.getAllTemplatesOfAType(
        "exportFile"
      );
      for (const template of exportFiles) {
        optionsToSelect.push({
          label: template,
          description: SilverfinToolkit.templateTypeMapper.exportFile
        });
      }
    }

    const selectedOption = await vscode.window.showQuickPick(optionsToSelect, {
      placeHolder: "Which template/s do you want to use?",
      title: "Select templates",
      canPickMany: true,
      matchOnDescription: true
    });

    this.extensionLogger.log("Selected template/s", selectedOption);

    return selectedOption;
  }

  /**
   * Show a QuickPick panel to select the firm to run the command on.
   * The options are all the firms the user has access to.
   * The default value is the current firm.
   * @returns A QuickPickItem with the selected firm
   */
  private async selectFirm() {
    const firmData =
      await SilverfinToolkit.firmCredentials.listAuthorizedFirms(); // [[firmId, firmName]...]
    const defaultFirm =
      await SilverfinToolkit.firmCredentials.getDefaultFirmId();
    const optionsToSelect: vscode.QuickPickItem[] = [];

    for (const firm of firmData) {
      let alreadyPicked = false;
      if (firm[0].toString() === defaultFirm.toString()) {
        alreadyPicked = true;
      }
      optionsToSelect.push({
        label: firm[0],
        description: firm[1],
        picked: alreadyPicked
      });
    }

    const selectedOption = await vscode.window.showQuickPick(optionsToSelect, {
      placeHolder: "Which firm do you want to use?",
      title: "Select a firm",
      canPickMany: true,
      matchOnDescription: true
    });

    this.extensionLogger.log("Selected firm", selectedOption);

    return selectedOption;
  }

  /**
   * Run the command on the selected templates in the selected firm.
   * The command is run using the Silverfin API.
   * @param firmId The id of the firm to run the command on
   * @param commandType The command to run
   * @param templates The templates to run the command on
   * @returns void
   */
  private async performEachTemplateCall(
    firmId: Number,
    commandType: string,
    templates: vscode.QuickPickItem[]
  ) {
    this.extensionLogger.log("Start command run", {
      commandType,
      templates,
      firmId
    });

    for (const template of templates) {
      const templateType = Object.keys(
        SilverfinToolkit.templateTypeMapper
      ).find(
        (key) =>
          SilverfinToolkit.templateTypeMapper[key] === template.description
      );
      const templateHandle = template.label;

      if (!templateType || !templateHandle || !commandType) {
        this.extensionLogger.log("Could not run command. Parameter missing", {
          templateType,
          templateHandle,
          commandType
        });
        return false;
      }

      let commandToRun;
      let commandArgs;
      let resultRun;

      if (commandType === "getTemplateId") {
        commandToRun = SilverfinToolkit.toolkit.getTemplateId;
        commandArgs = [String(firmId), templateType, templateHandle];
      } else {
        commandToRun =
          SilverfinToolkit.commandMapper[commandType][templateType];
        commandArgs = [String(firmId), templateHandle];
      }

      if (!commandToRun) {
        this.extensionLogger.log("Could not find command to run", {
          commandType,
          templateType,
          templateHandle
        });
        return false;
      }

      const commandCliName = commandToRun.name;
      this.extensionLogger.log("Run command", {
        commandType,
        commandCliName,
        commandArgs,
        templateType,
        templateHandle
      });

      const sfApi = new SilverfinToolkit();
      resultRun = await sfApi.callCommand(commandToRun, ...commandArgs);

      const userMessage = `${commandType}: ${templateHandle} (${SilverfinToolkit.templateTypeMapper[templateType]}) in firm ${firmId}`;
      if (resultRun) {
        this.userLogger.log(userMessage + " - Success");
      } else {
        this.userLogger.log(userMessage + " - Failed");
      }
    }
  }

  /**
   * Run the command on the selected shared parts and templates in the selected firm.
   * The command is run using the Silverfin API.
   * @param firmId The id of the firm to run the command on
   * @param commandType The command to run
   * @param sharedParts The shared parts to run the command on
   * @param templates The templates to run the command on
   * @returns void
   */
  private async performEachSharedPartCall(
    firmId: Number,
    commandType: string,
    sharedParts: vscode.QuickPickItem[],
    templates: vscode.QuickPickItem[]
  ) {
    this.extensionLogger.log("Start command run", {
      commandType,
      sharedParts,
      templates,
      firmId
    });

    for (const sharedPart of sharedParts) {
      const sharedPartHandle = sharedPart.label;

      for (const template of templates) {
        const templateType = Object.keys(
          SilverfinToolkit.templateTypeMapper
        ).find(
          (key) =>
            SilverfinToolkit.templateTypeMapper[key] === template.description
        );

        const templateHandle = template.label;

        if (
          !sharedPartHandle ||
          !templateType ||
          !templateHandle ||
          !commandType
        ) {
          this.extensionLogger.log("Could not run command. Parameter missing", {
            templateType,
            templateHandle,
            sharedPartHandle,
            commandType
          });
          return false;
        }

        let commandToRun;
        let commandArgs;
        let resultRun;

        commandToRun =
          SilverfinToolkit.commandMapper["sharedPart"][commandType];
        commandArgs = [
          String(firmId),
          sharedPartHandle,
          templateHandle,
          templateType
        ];

        const commandCliName = commandToRun.name;
        this.extensionLogger.log("Run command", {
          commandType,
          commandCliName,
          commandArgs,
          templateType,
          sharedPartHandle,
          templateHandle
        });

        const sfApi = new SilverfinToolkit();
        resultRun = await sfApi.callCommand(commandToRun, ...commandArgs);

        const userMessage = `${commandType} shared part "${sharedPartHandle}" to template "${templateHandle}" (${SilverfinToolkit.templateTypeMapper[templateType]}) in firm ${firmId}`;
        if (resultRun) {
          this.userLogger.log(userMessage + " - Success");
        } else {
          this.userLogger.log(userMessage + " - Failed");
        }
      }
    }
  }

  /**
   * Register the different commands to run on the templates.
   * The command is available in the Command Palette.
   * @returns void
   */
  private registerEvents() {
    const extensionContext = ExtensionContext.get();
    // Create templates in bulk
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(this.commandMapper.create, async () => {
        await this.runCommandOnTemplatesInBulk("create");
      })
    );
    // Import templates in bulk
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(this.commandMapper.import, async () => {
        await this.runCommandOnTemplatesInBulk("import");
      })
    );
    // Update templates in bulk
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(this.commandMapper.update, async () => {
        await this.runCommandOnTemplatesInBulk("update");
      })
    );
    // Get template id in bulk
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(
        this.commandMapper.getTemplateId,
        async () => {
          await this.runCommandOnTemplatesInBulk("getTemplateId");
        }
      )
    );
    // Add shared part in bulk
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(this.commandMapper.add, async () => {
        await this.runCommandOnSharedPartsInBulk("add");
      })
    );
    // Remove shared part in bulks
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(this.commandMapper.remove, async () => {
        await this.runCommandOnSharedPartsInBulk("remove");
      })
    );
    // Run a command on the selected templates
    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(
        this.commandMapper.commandSelector,
        async () => {
          await this.selectCommand();
        }
      )
    );
  }
}
