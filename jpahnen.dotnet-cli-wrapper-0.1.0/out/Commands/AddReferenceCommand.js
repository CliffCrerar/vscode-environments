"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const projectPickerItem_1 = require("../projectPickerItem");
class AddReferenceCommand {
    constructor(cliCall) {
        this.cliCall = cliCall;
    }
    execute(res) {
        vscode.workspace.findFiles("**/*.csproj").then((values) => {
            const items = values.filter((value) => value.path !== res.path)
                .map((value) => {
                const fileName = value.path.substring(value.path.lastIndexOf("/") + 1);
                return new projectPickerItem_1.ProjectPickerItem({ label: fileName, description: value.fsPath, fullPath: value.fsPath });
            });
            vscode.window.showQuickPick(items).then((selectedItem) => {
                if (!selectedItem) {
                    return;
                }
                this.cliCall.addReference(res.fsPath, selectedItem.fullPath)
                    .then(message => vscode.window.showInformationMessage(message));
            });
        });
    }
}
exports.AddReferenceCommand = AddReferenceCommand;
//# sourceMappingURL=addReferenceCommand.js.map