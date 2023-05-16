// file referenced in esbuild.js
// https://github.com/microsoft/vscode-webview-ui-toolkit/blob/main/docs/getting-started.md

import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeLink,
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton());
provideVSCodeDesignSystem().register(vsCodeLink());
