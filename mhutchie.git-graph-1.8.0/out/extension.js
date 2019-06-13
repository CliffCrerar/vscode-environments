"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const avatarManager_1 = require("./avatarManager");
const config_1 = require("./config");
const dataSource_1 = require("./dataSource");
const diffDocProvider_1 = require("./diffDocProvider");
const extensionState_1 = require("./extensionState");
const gitGraphView_1 = require("./gitGraphView");
const repoManager_1 = require("./repoManager");
const statusBarItem_1 = require("./statusBarItem");
const utils_1 = require("./utils");
function activate(context) {
    const extensionState = new extensionState_1.ExtensionState(context);
    const dataSource = new dataSource_1.DataSource();
    const avatarManager = new avatarManager_1.AvatarManager(dataSource, extensionState);
    const statusBarItem = new statusBarItem_1.StatusBarItem(context);
    const repoManager = new repoManager_1.RepoManager(dataSource, extensionState, statusBarItem);
    context.subscriptions.push(vscode.commands.registerCommand('git-graph.view', args => {
        let loadRepo = null;
        if (typeof args === 'object' && args.rootUri) {
            loadRepo = utils_1.getPathFromUri(args.rootUri);
            if (!repoManager.isKnownRepo(loadRepo)) {
                repoManager.registerRepo(loadRepo, true, true).then(valid => {
                    if (!valid)
                        loadRepo = null;
                    gitGraphView_1.GitGraphView.createOrShow(context.extensionPath, dataSource, extensionState, avatarManager, repoManager, loadRepo);
                });
                return;
            }
        }
        else if (config_1.getConfig().openToTheRepoOfTheActiveTextEditorDocument() && vscode.window.activeTextEditor) {
            loadRepo = repoManager.getRepoContainingFile(utils_1.getPathFromUri(vscode.window.activeTextEditor.document.uri));
        }
        gitGraphView_1.GitGraphView.createOrShow(context.extensionPath, dataSource, extensionState, avatarManager, repoManager, loadRepo);
    }), vscode.commands.registerCommand('git-graph.addGitRepository', () => {
        vscode.window.showOpenDialog({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false }).then(uris => {
            if (uris && uris.length > 0) {
                let path = utils_1.getPathFromUri(uris[0]);
                let folderName = path.substr(path.lastIndexOf('/') + 1);
                if (utils_1.isPathInWorkspace(path)) {
                    repoManager.registerRepo(path, false, false).then(valid => {
                        if (valid) {
                            vscode.window.showInformationMessage('The repository "' + folderName + '" was added to Git Graph.');
                        }
                        else {
                            vscode.window.showErrorMessage('The folder "' + folderName + '" is not a Git repository, and therefore could not be added to Git Graph.');
                        }
                    });
                }
                else {
                    vscode.window.showErrorMessage('The folder "' + folderName + '" is not within the opened Visual Studio Code workspace, and therefore could not be added to Git Graph.');
                }
            }
        });
    }), vscode.commands.registerCommand('git-graph.clearAvatarCache', () => {
        avatarManager.clearCache();
    }), vscode.workspace.registerTextDocumentContentProvider(diffDocProvider_1.DiffDocProvider.scheme, new diffDocProvider_1.DiffDocProvider(dataSource)), vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('git-graph.showStatusBarItem')) {
            statusBarItem.refresh();
        }
        else if (e.affectsConfiguration('git-graph.dateType')) {
            dataSource.generateGitCommandFormats();
        }
        else if (e.affectsConfiguration('git-graph.maxDepthOfRepoSearch')) {
            repoManager.maxDepthOfRepoSearchChanged();
        }
        else if (e.affectsConfiguration('git.path')) {
            dataSource.registerGitPath();
        }
    }), repoManager);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map