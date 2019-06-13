"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const bucketExplorer_1 = require("./bucketExplorer");
function activate(context) {
    const bucketExplorerProvider = new bucketExplorer_1.BucketTreeDataProvider(context);
    context.subscriptions.push(vscode.window.registerTreeDataProvider("bucketExplorer", bucketExplorerProvider));
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider("bucket", bucketExplorerProvider));
    context.subscriptions.push(vscode.commands.registerCommand("openBucketResource", (node) => {
        vscode.workspace.openTextDocument(node.resource).then(document => {
            vscode.window.showTextDocument(document);
        }, error => vscode.window.showErrorMessage(error.message));
    }));
    context.subscriptions.push(vscode.commands.registerCommand("bucketExplorerRefresh", () => bucketExplorerProvider.refresh()));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map