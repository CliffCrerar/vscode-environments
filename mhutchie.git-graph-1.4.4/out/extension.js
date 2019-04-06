"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const dataSource_1 = require("./dataSource");
const diffDocProvider_1 = require("./diffDocProvider");
const extensionState_1 = require("./extensionState");
const gitGraphView_1 = require("./gitGraphView");
const statusBarItem_1 = require("./statusBarItem");
function activate(context) {
    const extensionState = new extensionState_1.ExtensionState(context);
    const dataSource = new dataSource_1.DataSource();
    const statusBarItem = new statusBarItem_1.StatusBarItem(context, dataSource);
    context.subscriptions.push(vscode.commands.registerCommand('git-graph.view', () => {
        gitGraphView_1.GitGraphView.createOrShow(context.extensionPath, dataSource, extensionState);
    }));
    context.subscriptions.push(vscode.Disposable.from(vscode.workspace.registerTextDocumentContentProvider(diffDocProvider_1.DiffDocProvider.scheme, new diffDocProvider_1.DiffDocProvider(dataSource))));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('git-graph.showStatusBarItem')) {
            statusBarItem.refresh();
        }
        else if (e.affectsConfiguration('git-graph.dateType')) {
            dataSource.generateGitCommandFormats();
        }
        else if (e.affectsConfiguration('git.path')) {
            dataSource.registerGitPath();
        }
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map