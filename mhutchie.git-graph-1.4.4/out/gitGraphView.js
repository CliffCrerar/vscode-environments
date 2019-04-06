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
const path = require("path");
const vscode = require("vscode");
const config_1 = require("./config");
const diffDocProvider_1 = require("./diffDocProvider");
const repoFileWatcher_1 = require("./repoFileWatcher");
const repoFolderWatcher_1 = require("./repoFolderWatcher");
const utils_1 = require("./utils");
class GitGraphView {
    constructor(panel, extensionPath, dataSource, extensionState) {
        this.disposables = [];
        this.isGraphViewLoaded = false;
        this.isPanelVisible = true;
        this.currentRepo = null;
        this.panel = panel;
        this.extensionPath = extensionPath;
        this.dataSource = dataSource;
        this.extensionState = extensionState;
        panel.iconPath = config_1.getConfig().tabIconColourTheme() === 'colour'
            ? this.getUri('resources', 'webview-icon.svg')
            : { light: this.getUri('resources', 'webview-icon-light.svg'), dark: this.getUri('resources', 'webview-icon-dark.svg') };
        this.update();
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.onDidChangeViewState(() => {
            if (this.panel.visible !== this.isPanelVisible) {
                if (this.panel.visible) {
                    this.update();
                    this.repoFolderWatcher.start();
                }
                else {
                    this.currentRepo = null;
                    this.repoFileWatcher.stop();
                    this.repoFolderWatcher.stop();
                }
                this.isPanelVisible = this.panel.visible;
            }
        }, null, this.disposables);
        this.repoFileWatcher = new repoFileWatcher_1.RepoFileWatcher(() => {
            if (this.panel.visible) {
                this.sendMessage({ command: 'refresh' });
            }
        });
        this.repoFolderWatcher = new repoFolderWatcher_1.RepoFolderWatcher(() => __awaiter(this, void 0, void 0, function* () {
            let repos = yield this.dataSource.getRepos();
            if ((repos.length === 0 && this.isGraphViewLoaded) || (repos.length > 0 && !this.isGraphViewLoaded)) {
                this.update();
            }
            else {
                this.respondLoadRepos(repos);
            }
        }));
        this.panel.webview.onDidReceiveMessage((msg) => __awaiter(this, void 0, void 0, function* () {
            if (this.dataSource === null)
                return;
            this.repoFileWatcher.mute();
            switch (msg.command) {
                case 'addTag':
                    this.sendMessage({
                        command: 'addTag',
                        status: yield this.dataSource.addTag(msg.repo, msg.tagName, msg.commitHash, msg.lightweight, msg.message)
                    });
                    break;
                case 'checkoutBranch':
                    this.sendMessage({
                        command: 'checkoutBranch',
                        status: yield this.dataSource.checkoutBranch(msg.repo, msg.branchName, msg.remoteBranch)
                    });
                    break;
                case 'checkoutCommit':
                    this.sendMessage({
                        command: 'checkoutCommit',
                        status: yield this.dataSource.checkoutCommit(msg.repo, msg.commitHash)
                    });
                    break;
                case 'cherrypickCommit':
                    this.sendMessage({
                        command: 'cherrypickCommit',
                        status: yield this.dataSource.cherrypickCommit(msg.repo, msg.commitHash, msg.parentIndex)
                    });
                    break;
                case 'commitDetails':
                    this.sendMessage({
                        command: 'commitDetails',
                        commitDetails: yield this.dataSource.commitDetails(msg.repo, msg.commitHash)
                    });
                    break;
                case 'copyCommitHashToClipboard':
                    this.sendMessage({
                        command: 'copyCommitHashToClipboard',
                        success: yield utils_1.copyToClipboard(msg.commitHash)
                    });
                    break;
                case 'createBranch':
                    this.sendMessage({
                        command: 'createBranch',
                        status: yield this.dataSource.createBranch(msg.repo, msg.branchName, msg.commitHash)
                    });
                    break;
                case 'deleteBranch':
                    this.sendMessage({
                        command: 'deleteBranch',
                        status: yield this.dataSource.deleteBranch(msg.repo, msg.branchName, msg.forceDelete)
                    });
                    break;
                case 'deleteTag':
                    this.sendMessage({
                        command: 'deleteTag',
                        status: yield this.dataSource.deleteTag(msg.repo, msg.tagName)
                    });
                    break;
                case 'loadBranches':
                    this.sendMessage(Object.assign({ command: 'loadBranches' }, yield this.dataSource.getBranches(msg.repo, msg.showRemoteBranches), { hard: msg.hard }));
                    if (msg.repo !== this.currentRepo) {
                        this.currentRepo = msg.repo;
                        this.extensionState.setLastActiveRepo(msg.repo);
                        this.repoFileWatcher.start(msg.repo);
                    }
                    break;
                case 'loadCommits':
                    this.sendMessage(Object.assign({ command: 'loadCommits' }, yield this.dataSource.getCommits(msg.repo, msg.branchName, msg.maxCommits, msg.showRemoteBranches), { hard: msg.hard }));
                    break;
                case 'loadRepos':
                    this.respondLoadRepos(yield this.dataSource.getRepos());
                    break;
                case 'mergeBranch':
                    this.sendMessage({
                        command: 'mergeBranch',
                        status: yield this.dataSource.mergeBranch(msg.repo, msg.branchName, msg.createNewCommit)
                    });
                    break;
                case 'mergeCommit':
                    this.sendMessage({
                        command: 'mergeCommit',
                        status: yield this.dataSource.mergeCommit(msg.repo, msg.commitHash, msg.createNewCommit)
                    });
                    break;
                case 'pushTag':
                    this.sendMessage({
                        command: 'pushTag',
                        status: yield this.dataSource.pushTag(msg.repo, msg.tagName)
                    });
                    break;
                case 'renameBranch':
                    this.sendMessage({
                        command: 'renameBranch',
                        status: yield this.dataSource.renameBranch(msg.repo, msg.oldName, msg.newName)
                    });
                    break;
                case 'resetToCommit':
                    this.sendMessage({
                        command: 'resetToCommit',
                        status: yield this.dataSource.resetToCommit(msg.repo, msg.commitHash, msg.resetMode)
                    });
                    break;
                case 'revertCommit':
                    this.sendMessage({
                        command: 'revertCommit',
                        status: yield this.dataSource.revertCommit(msg.repo, msg.commitHash, msg.parentIndex)
                    });
                    break;
                case 'viewDiff':
                    this.sendMessage({
                        command: 'viewDiff',
                        success: yield this.viewDiff(msg.repo, msg.commitHash, msg.oldFilePath, msg.newFilePath, msg.type)
                    });
                    break;
            }
            this.repoFileWatcher.unmute();
        }), null, this.disposables);
    }
    static createOrShow(extensionPath, dataSource, extensionState) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (GitGraphView.currentPanel) {
            GitGraphView.currentPanel.panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('git-graph', 'Git Graph', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(extensionPath, 'media'))
            ]
        });
        GitGraphView.currentPanel = new GitGraphView(panel, extensionPath, dataSource, extensionState);
    }
    dispose() {
        GitGraphView.currentPanel = undefined;
        this.panel.dispose();
        this.repoFileWatcher.stop();
        this.repoFolderWatcher.stop();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            this.panel.webview.html = yield this.getHtmlForWebview();
        });
    }
    getHtmlForWebview() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = config_1.getConfig(), nonce = getNonce();
            let viewState = {
                autoCenterCommitDetailsView: config.autoCenterCommitDetailsView(),
                dateFormat: config.dateFormat(),
                graphColours: config.graphColours(),
                graphStyle: config.graphStyle(),
                initialLoadCommits: config.initialLoadCommits(),
                lastActiveRepo: this.extensionState.getLastActiveRepo(),
                loadMoreCommits: config.loadMoreCommits(),
                repos: yield this.dataSource.getRepos(),
                showCurrentBranchByDefault: config.showCurrentBranchByDefault()
            };
            let colourStyles = '', body;
            for (let i = 0; i < viewState.graphColours.length; i++) {
                colourStyles += '.colour' + i + ' { background-color:' + viewState.graphColours[i] + '; } ';
            }
            if (viewState.repos.length > 0) {
                body = `<body>
			<div id="controls">
				<span id="repoControl"><span class="unselectable">Repo: </span><div id="repoSelect" class="dropdown"></div></span>
				<span id="branchControl"><span class="unselectable">Branch: </span><div id="branchSelect" class="dropdown"></div></span>
				<label id="showRemoteBranchesControl"><input type="checkbox" id="showRemoteBranchesCheckbox" value="1" checked>Show Remote Branches</label>
				<div id="refreshBtn" class="roundedBtn">Refresh</div>
			</div>
			<div id="content">
				<div id="commitGraph"></div>
				<div id="commitTable"></div>
			</div>
			<ul id="contextMenu"></ul>
			<div id="dialogBacking"></div>
			<div id="dialog"></div>
			<script nonce="${nonce}">var viewState = ${JSON.stringify(viewState)};</script>
			<script src="${this.getMediaUri('out.min.js')}"></script>
			</body>`;
            }
            else {
                body = `<body class="unableToLoad"><h1>Git Graph</h1><p>Unable to load Git Graph. Either the current workspace is not a Git Repository, or the Git executable could not found.</p></body>`;
            }
            this.isGraphViewLoaded = viewState.repos.length > 0;
            return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src vscode-resource: 'unsafe-inline'; script-src vscode-resource: 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link rel="stylesheet" type="text/css" href="${this.getMediaUri('main.css')}">
				<link rel="stylesheet" type="text/css" href="${this.getMediaUri('dropdown.css')}">
				<title>Git Graph</title>
				<style>${colourStyles}</style>
			</head>
			${body}
		</html>`;
        });
    }
    getMediaUri(file) {
        return this.getUri('media', file).with({ scheme: 'vscode-resource' });
    }
    getUri(...pathComps) {
        return vscode.Uri.file(path.join(this.extensionPath, ...pathComps));
    }
    respondLoadRepos(repos) {
        this.sendMessage({
            command: 'loadRepos',
            repos: repos,
            lastActiveRepo: this.extensionState.getLastActiveRepo()
        });
    }
    sendMessage(msg) {
        this.panel.webview.postMessage(msg);
    }
    viewDiff(repo, commitHash, oldFilePath, newFilePath, type) {
        let abbrevHash = utils_1.abbrevCommit(commitHash);
        let pathComponents = newFilePath.split('/');
        let title = pathComponents[pathComponents.length - 1] + ' (' + (type === 'A' ? 'Added in ' + abbrevHash : type === 'D' ? 'Deleted in ' + abbrevHash : utils_1.abbrevCommit(commitHash) + '^ ↔ ' + utils_1.abbrevCommit(commitHash)) + ')';
        return new Promise((resolve) => {
            vscode.commands.executeCommand('vscode.diff', diffDocProvider_1.encodeDiffDocUri(repo, oldFilePath, commitHash + '^'), diffDocProvider_1.encodeDiffDocUri(repo, newFilePath, commitHash), title, { preview: true })
                .then(() => resolve(true))
                .then(() => resolve(false));
        });
    }
}
exports.GitGraphView = GitGraphView;
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=gitGraphView.js.map