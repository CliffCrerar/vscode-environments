"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const npmScripts_1 = require("./npmScripts");
const executeCommand_1 = require("./executeCommand");
function activate(context) {
    const rootPath = vscode.workspace.rootPath || ".";
    const terminals = new Map();
    const nodeProvider = new npmScripts_1.NpmScriptsNodeProvider(rootPath);
    vscode.window.registerTreeDataProvider("npmScripts", nodeProvider);
    vscode.window.onDidCloseTerminal(term => terminals.delete(term.name));
    vscode.commands.registerCommand("npmScripts.executeCommand", executeCommand_1.executeCommand(terminals));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map