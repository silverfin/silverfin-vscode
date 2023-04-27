/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";

export type ResultDetails = {
  test?: string;
  result?: string;
  got: any;
  expected: any;
  line_number: number;
};

export type ResultObj = {
  [key: string]: ResultDetails;
};

export type testObject = {
  [key: string]: {
    reconciled: ResultDetails | null;
    results: ResultObj | {};
    rollforwards: ResultObj | {};
    html?: string;
  };
};

export type ResponseObject = {
  status: "completed" | "internal_error" | "test_error" | "started";
  tests: testObject;
  error_line_number?: number;
  error_message?: string;
};

export type DiagnosticObject = {
  range: vscode.Range;
  code?: string;
  message: string;
  severity: vscode.DiagnosticSeverity;
  source: string; // We store the expected value here
  tags?: vscode.DiagnosticTag[];
  // relatedInformation?: vscode.DiagnosticRelatedInformation[];
};

export type StoredDiagnostic = {
  range: [
    { line: number; character: number },
    { line: number; character: number }
  ];
  code?: string;
  message: string;
  severity: number;
  source: string; // We store the expected value here
  tags?: any;
  // relatedInformation?: [
  //   {
  //     range: [
  //       { line: number; character: number },
  //       { line: number; character: number }
  //     ];
  //     message: string;
  //   }
  // ];
};

// Convert the stored data back into a Diagnostic
export function diagnosticParser(
  diagnosticStored: StoredDiagnostic
): DiagnosticObject {
  let diagnosticRecreated: DiagnosticObject = {
    range: new vscode.Range(
      new vscode.Position(
        diagnosticStored.range[0].line,
        diagnosticStored.range[0].character
      ),
      new vscode.Position(
        diagnosticStored.range[1].line,
        diagnosticStored.range[1].character
      )
    ),
    message: diagnosticStored.message,
    severity: vscode.DiagnosticSeverity.Error,
    source: diagnosticStored.source,
    code: diagnosticStored.code,
  };
  return diagnosticRecreated;
}
