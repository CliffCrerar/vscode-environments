'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const question_mode_1 = require("./commands/question-mode");
let _commands = [];
function getCommands() {
    if (!_commands.length) {
        _commands = [
            new question_mode_1.RunnerRunQuestionMode()
        ];
    }
    return _commands;
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const toolbarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    toolbarItem.text = 'Postman';
    toolbarItem.show();
    getCommands().forEach(c => c.subscribe(context, toolbarItem));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map