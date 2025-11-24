import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;

export function activateLiquidLanguageServer(
  context: vscode.ExtensionContext
): void {
  // The server is in the liquid-ls submodule
  const serverModule = context.asAbsolutePath(
    path.join("liquid-ls", "out", "index.js")
  );

  // Check if the server module exists
  if (!fs.existsSync(serverModule)) {
    console.error(
      "[Liquid LS] Language server not found at:",
      serverModule,
      "- Language server features will not be available"
    );
    return;
  }

  // Debug options for the server
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: debugOptions
    }
  };

  // Get configuration from VS Code settings
  const config = vscode.workspace.getConfiguration("silverfinLiquid");
  const hoverEnabled = config.get<boolean>("hover.enabled", true);
  const logLevel = config.get<string>("logLevel", "info");

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for liquid documents
    documentSelector: [{ scheme: "file", language: "liquid" }],
    synchronize: {
      // Notify the server about file changes to '.liquid' files contained in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.liquid"),
      // Also synchronize configuration changes
      configurationSection: "silverfinLiquid"
    },
    initializationOptions: {
      // Pass configuration from VS Code settings
      hover: hoverEnabled,
      logLevel: logLevel
    }
  };

  // Create the language client and start the client
  client = new LanguageClient(
    "liquidLanguageServer",
    "Liquid Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  console.log("[Liquid LS] Language server started successfully");
}

export function deactivateLiquidLanguageServer(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
