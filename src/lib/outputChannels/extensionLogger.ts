import * as vscode from "vscode";

/**
 * This class is responsible for creating an output channel for the extension logs.
 * It is a singleton class, meaning that only one instance of it can be created.
 * This class is used to log the extension's activities and errors.
 * Initialize it by calling the `plug` method.
 * Use the `log` method to log messages.
 */
export default class ExtensionLogger {
  private static uniqueInstance: ExtensionLogger | null = null;
  outputChannel: vscode.OutputChannel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel(
      "Silverfin (Extension Logs)"
    );
  }

  /**
   * @returns The unique instance of the ExtensionLogger class.
   * If it does not exist, it will create it.
   */
  public static plug(): ExtensionLogger {
    if (!ExtensionLogger.uniqueInstance) {
      ExtensionLogger.uniqueInstance = new ExtensionLogger();
    }
    return ExtensionLogger.uniqueInstance;
  }

  /**
   * @param args - The message to log. Can be a string or an object.
   * Logs the message to the output channel.
   * If the message is an object, it will be stringified.
   * The message will be prefixed with the name of the class that called the log method.
   */
  public log(...args: (string | any)[]): void {
    let message = args
      .map((arg) => {
        if (typeof arg === "string") {
          return arg;
        } else {
          return JSON.stringify(arg);
        }
      })
      .join(" || ");
    message = `${this.getDate()} ${message}`;
    this.outputChannel.appendLine(message);
  }

  private getDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `[${day}/${month}/${year} ${hours}:${minutes}]`;
  }
}
