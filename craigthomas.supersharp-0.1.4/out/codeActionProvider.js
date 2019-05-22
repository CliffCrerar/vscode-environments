'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const injectDependency_1 = require("./Actions/injectDependency");
const moveTypeToNewFileAction_1 = require("./Actions/moveTypeToNewFileAction");
class CodeActionProvider {
    constructor() {
        this.moveTypeToNewFileAction = new moveTypeToNewFileAction_1.default();
        this.injectDependency = new injectDependency_1.default();
        vscode.commands.registerCommand(moveTypeToNewFileAction_1.default.actionId, this.moveTypeToNewFileAction.executeAction, this.moveTypeToNewFileAction);
        vscode.commands.registerCommand(injectDependency_1.default.actionId, this.injectDependency.executeAction, this.injectDependency);
    }
    provideCodeActions(document, range, context, token) {
        var commands = [];
        let moveTypeToNewFileCommand = this.moveTypeToNewFileAction.tryGetCommand(document, range);
        if (moveTypeToNewFileCommand) {
            commands.push(moveTypeToNewFileCommand);
        }
        let injectDependencyCommand = this.injectDependency.tryGetCommand(document, range);
        if (injectDependencyCommand) {
            commands.push(injectDependencyCommand);
        }
        return commands;
    }
}
exports.default = CodeActionProvider;
//# sourceMappingURL=codeActionProvider.js.map