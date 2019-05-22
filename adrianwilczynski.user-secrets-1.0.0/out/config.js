"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configSection = 'userSecrets.ask';
function shouldAsk() {
    const config = vscode.workspace
        .getConfiguration()
        .get(configSection);
    if (config === undefined) {
        return true;
    }
    return !!config;
}
exports.shouldAsk = shouldAsk;
function dontAskAgain() {
    vscode.workspace
        .getConfiguration()
        .update(configSection, false, vscode.ConfigurationTarget.Global);
}
exports.dontAskAgain = dontAskAgain;
//# sourceMappingURL=config.js.map