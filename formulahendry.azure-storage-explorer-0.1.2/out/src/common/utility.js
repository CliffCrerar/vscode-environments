"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Utility {
    static getConfiguration() {
        return vscode.workspace.getConfiguration("azure-storage-explorer");
    }
    static appendLine(message) {
        this._outputChannel.show();
        this._outputChannel.appendLine(message);
    }
}
Utility._outputChannel = vscode.window.createOutputChannel("Azure Storage");
exports.Utility = Utility;
//# sourceMappingURL=utility.js.map