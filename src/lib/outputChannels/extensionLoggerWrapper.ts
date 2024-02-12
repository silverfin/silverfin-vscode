import ExtensionLogger from "./extensionLogger";

/**
 * Wrapper class around ExtensionLogger.
 * We want to have only one output channel, created by ExtensionLogger.
 * But want to be able to identify in which class is used, with this wrapper.
 * So one instance of the Wrapper is created in each Class using it.
 * It implements the same methods and log(), it will add the class name when calling it.
 */
export default class ExtensionLoggerWrapper {
  private extensionLogger: ExtensionLogger = ExtensionLogger.plug();
  private callerName: string;
  constructor(callerName: string) {
    this.callerName = callerName;
  }

  /**
   * It add the caller name and pass the message to ExtensionLogger
   */
  public log(...args: (string | any)[]): void {
    const callerName = `[${this.callerName}]`;
    this.extensionLogger.log(callerName, ...args);
  }
}
