/**
 * From a diagnostic message, get the expected and got values
 * @param message - The message of the error
 * @returns  - The expected and got values
 * @example
 * getExpectedGotFromMessage("Expected: 1 Got: 2") // ["1", "2"]
 */
export function getExpectedGotFromMessage(message: string): any {
  const nameRegex = /^\[(.*?)\]/;
  const expectedRegex = /Expected:\s*(.*?)\s*\(/;
  const gotRegex = /Got:\s*(.*?)\s*\(/;
  const typeRegex = /\)\s*\|\s*Got:.*\((.*?)\)/;

  const nameMatch = message.match(nameRegex);
  const expectedMatch = message.match(expectedRegex);
  const gotMatch = message.match(gotRegex);
  const typeMatch = message.match(typeRegex);

  const result = {
    name: nameMatch ? nameMatch[1] : "",
    expected: expectedMatch
      ? expectedMatch[1] === "null"
        ? null
        : expectedMatch[1]
      : "",
    got: gotMatch ? gotMatch[1] : "",
    type: typeMatch ? typeMatch[1] : ""
  };

  return result;
}
