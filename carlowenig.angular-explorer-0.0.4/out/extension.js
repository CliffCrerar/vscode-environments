'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const angularDataProvider_1 = require("./tree/angularDataProvider");
function activate(context) {
    vscode.commands.executeCommand('setContext', 'isAngularProject', true);
    const angularDataProvider = new angularDataProvider_1.AngularDataProvider();
    vscode.window.registerTreeDataProvider('angularExplorer', angularDataProvider);
    /**
     * Commands
     */
    vscode.commands.registerCommand('angularExplorer.openNgObject', (treeItem) => {
        const files = treeItem.ngObject.files;
        if (files) {
            showNgFileCollection(files);
        }
    });
    vscode.commands.registerCommand('angularExplorer.refreshExplorer', () => {
        angularDataProvider.refresh();
    });
    vscode.commands.registerCommand('angularExplorer.openScript', (treeItem) => {
        openNgFile(treeItem.ngObject.files.scriptUri, undefined, true);
    });
    vscode.commands.registerCommand('angularExplorer.openTemplate', (treeItem) => {
        openNgFile(treeItem.ngObject.files.templateUri, treeItem.ngObject.files.scriptUri, true);
    });
    vscode.commands.registerCommand('angularExplorer.openStyles', (treeItem) => {
        openNgFiles(treeItem.ngObject.files.styleUris, treeItem.ngObject.files.scriptUri, true);
    });
    vscode.commands.registerCommand('angularExplorer.openSpec', (treeItem) => {
        openNgFile(treeItem.ngObject.files.specUri, undefined, true);
    });
    /**
     * Events
     */
}
exports.activate = activate;
function showNgFileCollection(collection) {
    const hasTemplate = collection.templateUri !== undefined;
    vscode.window.showTextDocument(collection.scriptUri, {
        viewColumn: hasTemplate ? 1 : -1,
        preserveFocus: false,
        preview: true
    });
    if (collection.templateUri) {
        vscode.window.showTextDocument(collection.templateUri, {
            viewColumn: 2,
            preserveFocus: true,
            preview: true
        });
    }
}
function openNgFile(uri, alt, keep = false) {
    return new Promise((resolve, reject) => {
        if (uri) {
            vscode.window.showTextDocument(uri, {
                preview: !keep,
                viewColumn: vscode.ViewColumn.Active
            }).then(value => resolve(), reason => {
                if (alt) {
                    vscode.window.showTextDocument(alt, {
                        preview: !keep,
                        viewColumn: vscode.ViewColumn.Active
                    }).then(value => resolve(), reason => {
                        vscode.window.showErrorMessage(reason);
                        reject();
                    });
                }
            });
        }
        else {
            reject();
        }
    });
}
function openNgFilesRecursively(index, uris, alt, keep = false) {
    openNgFile(uris[index], alt, keep).then(() => {
        if (index < uris.length - 1) {
            openNgFilesRecursively(index + 1, uris, alt, keep);
        }
    });
}
function openNgFiles(uris, alt, keep = false) {
    if (uris && uris.length > 0) {
        openNgFilesRecursively(0, uris, alt, keep);
    }
    else {
        openNgFile(alt, undefined, keep);
    }
}
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map