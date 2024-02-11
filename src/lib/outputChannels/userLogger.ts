import * as vscode from "vscode";

/**
 * This class is responsible for creating an output channel destinated to the User
 * It is a singleton class, meaning that only one instance of it can be created.
 * This class is used to log output relevant to the user.
 * Initialize it by calling the `plug` method.
 * Use the `log` method to log messages.
 */
export default class UserLogger {
  private static uniqueInstance: UserLogger | null = null;
  outputChannel: vscode.OutputChannel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel("Silverfin (Users)");
  }

  /**
   * @returns The unique instance of the UserLogger.
   * If it does not exist, it will create it.
   */
  public static plug(): UserLogger {
    if (!UserLogger.uniqueInstance) {
      UserLogger.uniqueInstance = new UserLogger();
    }
    return UserLogger.uniqueInstance;
  }

  /**
   * @param message - The message to log.
   * Logs the message to the output channel. The message is intented to be read by the user.
   */
  public log(message: string): void {
    this.outputChannel.appendLine(message);
  }
}
