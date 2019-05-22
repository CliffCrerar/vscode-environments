'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const codeActionProvider_1 = require("./codeActionProvider");
function activate(context) {
    const documentSelector = {
        language: 'csharp',
        scheme: 'file'
    };
    const codeActionProvider = new codeActionProvider_1.default();
    let disposable = vscode.languages.registerCodeActionsProvider(documentSelector, codeActionProvider);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map