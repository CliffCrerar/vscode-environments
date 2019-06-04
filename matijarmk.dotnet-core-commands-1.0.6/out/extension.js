'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const dotnet_1 = require("./Commands/dotnet");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    exports.outputTerminal = vscode.window.createTerminal("dotnet");
    exports.outputChannel = vscode.window.createOutputChannel("dotnet");
    context.subscriptions.push(exports.outputChannel);
    context.subscriptions.push(exports.outputTerminal);
    registerCommands(context);
}
exports.activate = activate;
function registerCommands(context) {
    context.subscriptions.push(dotnet_1.dotnet);
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map