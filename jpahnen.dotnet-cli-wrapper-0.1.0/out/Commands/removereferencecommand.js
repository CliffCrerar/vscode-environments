"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class RemoveReferenceCommand {
    constructor(cliCall) {
        this.cliCall = cliCall;
    }
    execute(res) {
        this.cliCall.getReferences(res.fsPath).then(references => {
            vscode.window.showQuickPick(references).then((selectedItem) => {
                if (!selectedItem) {
                    return;
                }
                this.cliCall.removeReference(res.fsPath, selectedItem).then((message) => {
                    vscode.window.showInformationMessage(message);
                });
            });
        });
    }
}
exports.RemoveReferenceCommand = RemoveReferenceCommand;
//# sourceMappingURL=removeReferenceCommand.js.map