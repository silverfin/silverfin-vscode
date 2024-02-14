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
  constructor() {}
}
