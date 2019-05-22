'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const jsProvider_1 = require("./jsProvider");
function activate(context) {
    const collection = vscode.languages.createDiagnosticCollection('test');
    if (vscode.window.activeTextEditor) {
        // updateDiagnostics(vscode.window.activeTextEditor.document, collection);
    }
    let linter = new jsProvider_1.default();
    linter.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider('javascriptreact', linter);
    vscode.languages.registerCodeActionsProvider('javascript', linter);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map