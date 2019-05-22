'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const cliWrapper_1 = require("./cliWrapper");
const addProjectCommand_1 = require("./commands/addProjectCommand");
const addReferenceCommand_1 = require("./commands/addReferenceCommand");
const removeReferenceCommand_1 = require("./commands/removeReferenceCommand");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const cliCall = new cliWrapper_1.CliWrapper();
    cliCall.getCliVersion().then(version => console.log(version));
    let addReferenceCommand = vscode.commands.registerCommand('dotnetcli.addReference', (res) => {
        const cmd = new addReferenceCommand_1.AddReferenceCommand(cliCall);
        cmd.execute(res);
    });
    context.subscriptions.push(addReferenceCommand);
    let removeReferenceCommand = vscode.commands.registerCommand('dotnetcli.removeReference', (res) => {
        const cmd = new removeReferenceCommand_1.RemoveReferenceCommand(cliCall);
        cmd.execute(res);
    });
    context.subscriptions.push(removeReferenceCommand);
    let addProjectCommand = vscode.commands.registerCommand('dotnetcli.addproject', (res) => {
        const cmd = new addProjectCommand_1.AddProjectCommand(cliCall);
        cmd.execute(res);
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map