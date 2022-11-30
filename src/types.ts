/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";

export type ResultArray = {
  test: string;
  result: string;
  got: any;
  expected: any;
  line_number: number;
}[];

export type ResponseObject = {
  status: "completed" | "internal_error" | "test_error" | "started";
  result?: ResultArray;
  error_line_number?: number;
  error_message?: string;
};

export type DiagnosticObject = {
  range: vscode.Range;
  code?: string;
  message: string;
  severity: vscode.DiagnosticSeverity;
  source: string;
  tags?: vscode.DiagnosticTag[];
};
