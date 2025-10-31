import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from "vscode-languageclient/node";
import ExtensionLoggerWrapper from "./outputChannels/extensionLoggerWrapper";
import { LanguageServerSettings, SettingsHandler } from "./settingsHandler";

const SERVER_COMMAND = "silverfin-ls";

const logger = new ExtensionLoggerWrapper("SilverfinLanguageClient");
let client: LanguageClient | undefined;
let restartChain: Promise<void> = Promise.resolve();
let isDeactivating = false;
let fileWatcher: vscode.FileSystemWatcher | undefined;

function buildClient(settings: LanguageServerSettings): LanguageClient {
  const command = settings.customServerPath || SERVER_COMMAND;

  const serverOptions: ServerOptions = {
    command,
    args: ["--stdio"],
    options: {}
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "liquid" }],
    synchronize: {
      fileEvents: fileWatcher!
    }
  };

  return new LanguageClient(
    "silverfinLanguageServer",
    "Silverfin Language Server",
    serverOptions,
    clientOptions
  );
}

async function startClient(settings: LanguageServerSettings): Promise<void> {
  if (client) {
    return;
  }
  const candidate = buildClient(settings);
  try {
    await candidate.start();
    client = candidate;
    logger.log("Language server started successfully");
  } catch (err) {
    logger.log("Failed to start language server:", err);
    const source = settings.customServerPath
      ? `from "${settings.customServerPath}"`
      : "from PATH";
    vscode.window.showWarningMessage(
      `Silverfin Language Server (${SERVER_COMMAND}) could not be started ${source}. ` +
        `Install it and ensure it is on your PATH, or set "silverfin.languageServerPath". ` +
        `LSP features (hover, go-to-definition) will be disabled for this session.`
    );
    client = undefined;
  }
}

async function stopClient(): Promise<void> {
  if (!client) {
    return;
  }
  const running = client;
  client = undefined;
  await running.stop();
}

function scheduleRestart(next: LanguageServerSettings): void {
  if (isDeactivating) {
    return;
  }
  restartChain = restartChain
    .then(() => stopClient())
    .then(() => (next.enable ? startClient(next) : undefined))
    .catch((err) => {
      logger.log("restart failed:", err);
    });
}

export function activateSilverfinLanguageServer(
  context: vscode.ExtensionContext,
  settings: SettingsHandler
): void {
  fileWatcher = vscode.workspace.createFileSystemWatcher("**/*.liquid");
  context.subscriptions.push(fileWatcher);
  scheduleRestart(settings.read());
  context.subscriptions.push(
    settings.onChange((next) => scheduleRestart(next))
  );
}

export function deactivateSilverfinLanguageServer():
  | Thenable<void>
  | undefined {
  isDeactivating = true;
  restartChain = restartChain
    .then(() => stopClient())
    .catch((err) => {
      logger.log("shutdown failed:", err);
    });
  return restartChain;
}
