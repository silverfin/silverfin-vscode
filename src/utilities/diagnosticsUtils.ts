/**
 * From a diagnostic message, get the expected and got values
 * @param message - The message of the error
 * @returns  - The expected and got values
 * @example
 * getExpectedGotFromMessage("Expected: 1 Got: 2") // ["1", "2"]
 */
export function getExpectedGotFromMessage(message: string): string[] {
  const output = [];
  const expectedRegex = /Expected:\s*([^(]+)/g;
  const expectedMatch = message.match(expectedRegex);
  if (expectedMatch) {
    output.push(expectedMatch[0].replace("Expected: ", ""));
  } else {
    output.push("");
  }
  const gotRegex = /Got:\s*([^(]+)/g;
  const gotMatch = message.match(gotRegex);
  if (gotMatch) {
    output.push(gotMatch[0].replace("Got: ", ""));
  } else {
    output.push("");
  }
  return output;
}
