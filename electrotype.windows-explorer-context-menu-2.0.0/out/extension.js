"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function openContextMenu(fileUri, useRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        let filePath;
        if (!fileUri) {
            if (!useRoot) {
                return;
            }
            if (!vscode.workspace || vscode.workspace.workspaceFolders === undefined || vscode.workspace.workspaceFolders === null) {
                if (!vscode.workspace.rootPath) {
                    return;
                }
                filePath = vscode.workspace.rootPath;
            }
            else {
                if (vscode.workspace.workspaceFolders.length < 1) {
                    return;
                }
                filePath = vscode.workspace.workspaceFolders[vscode.workspace.workspaceFolders.length - 1].uri.fsPath;
            }
        }
        else if (useRoot) {
            // Old VSCode version (no multi-root workspace)?
            if (!vscode.workspace || !vscode.workspace.workspaceFolders) {
                filePath = vscode.workspace.rootPath;
            }
            else {
                // Find the parent root path
                filePath = fileUri.fsPath.replace(/\\/g, "/");
                let rootPath;
                for (let workspaceFolder of vscode.workspace.workspaceFolders) {
                    let rootPathTemp = workspaceFolder.uri.fsPath.replace(/\\/g, "/");
                    if (filePath === rootPathTemp || filePath.startsWith(rootPathTemp + "/")) {
                        rootPath = workspaceFolder.uri.fsPath;
                        break;
                    }
                }
                if (!rootPath) {
                    return;
                }
                filePath = rootPath;
            }
        }
        else {
            filePath = fileUri.fsPath;
        }
        const config = vscode.workspace.getConfiguration('windowsExplorerContextMenu');
        let exeName = config.executable;
        if (!exeName) {
            exeName = "AutohotkeyContextMenu.exe";
        }
        const execFile = require('child_process').execFile;
        const bat = execFile(__dirname + '\\..\\executables\\' + exeName, [filePath], (error, stdout, stderr) => { });
    });
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Open context menu on current file
    let disposable = vscode.commands.registerCommand('extension.windowsExplorerContextMenuCurrent', function (fileUri) {
        openContextMenu(fileUri, false);
    });
    context.subscriptions.push(disposable, false);
    // Open context menu on selected file/folder
    disposable = vscode.commands.registerCommand('extension.windowsExplorerContextMenu', function (fileUri) {
        openContextMenu(fileUri, false);
    });
    context.subscriptions.push(disposable);
    // Open context menu on root folder
    disposable = vscode.commands.registerCommand('extension.windowsExplorerContextMenuRoot', function (fileUri) {
        openContextMenu(fileUri, true);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map