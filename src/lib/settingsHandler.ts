import * as vscode from "vscode";
import ExtensionLoggerWrapper from "./outputChannels/extensionLoggerWrapper";

const CONFIG_SECTION = "silverfin";
const ENABLE_KEY = "languageServerEnable";
const PATH_KEY = "languageServerPath";
const WATCHED_KEYS = [
  `${CONFIG_SECTION}.${ENABLE_KEY}`,
  `${CONFIG_SECTION}.${PATH_KEY}`
] as const;

export interface LanguageServerSettings {
  readonly enable: boolean;
  readonly customServerPath: string;
}

export type SettingsListener = (next: LanguageServerSettings) => void;

export class SettingsHandler {
  private readonly listeners: SettingsListener[] = [];
  private logger: ExtensionLoggerWrapper = new ExtensionLoggerWrapper(
    "SettingsHandler"
  );

  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        const affected = WATCHED_KEYS.some((key) =>
          event.affectsConfiguration(key)
        );
        if (!affected) {
          return;
        }
        const next = this.read();
        for (const listener of [...this.listeners]) {
          try {
            listener(next);
          } catch (error) {
            this.logger.log("Settings listener failed", error);
          }
        }
      })
    );
  }

  read(): LanguageServerSettings {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return {
      enable: config.get<boolean>(ENABLE_KEY, false),
      customServerPath: config.get<string>(PATH_KEY, "").trim()
    };
  }

  onChange(listener: SettingsListener): vscode.Disposable {
    this.listeners.push(listener);
    return new vscode.Disposable(() => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    });
  }
}
