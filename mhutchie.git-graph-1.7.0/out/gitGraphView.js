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
const repoFileWatcher_1 = require("./repoFileWatcher");
const utils_1 = require("./utils");
class GitGraphView {
    constructor(extensionPath, dataSource, extensionState, avatarManager, repoManager, loadRepo, column) {
        this.disposables = [];
        this.isGraphViewLoaded = false;
        this.isPanelVisible = true;
        this.currentRepo = null;
        this.loadRepo = null;
        this.extensionPath = extensionPath;
        this.avatarManager = avatarManager;
        this.dataSource = dataSource;
        this.extensionState = extensionState;
        this.repoManager = repoManager;
        this.loadRepo = loadRepo;
        this.avatarManager.registerView(this);
        this.panel = vscode.window.createWebviewPanel('git-graph', 'Git Graph', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))],
            retainContextWhenHidden: config_1.getConfig().retainContextWhenHidden()
        });
        this.panel.iconPath = config_1.getConfig().tabIconColourTheme() === 'colour'
            ? this.getUri('resources', 'webview-icon.svg')
            : { light: this.getUri('resources', 'webview-icon-light.svg'), dark: this.getUri('resources', 'webview-icon-dark.svg') };
        this.update();
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.onDidChangeViewState(() => {
            if (this.panel.visible !== this.isPanelVisible) {
                if (this.panel.visible) {
                    this.update();
                }
                else {
                    this.currentRepo = null;
                    this.repoFileWatcher.stop();
                }
                this.isPanelVisible = this.panel.visible;
            }
        }, null, this.disposables);
        this.repoFileWatcher = new repoFileWatcher_1.RepoFileWatcher(() => {
            if (this.panel.visible) {
                this.sendMessage({ command: 'refresh' });
            }
        });
        this.repoManager.registerViewCallback((repos, numRepos) => {
            if (!this.panel.visible)
                return;
            if ((numRepos === 0 && this.isGraphViewLoaded) || (numRepos > 0 && !this.isGraphViewLoaded)) {
                this.update();
            }
            else {
                this.respondLoadRepos(repos, null);
            }
        });
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
                case 'cleanUntrackedFiles':
                    this.sendMessage({
                        command: 'cleanUntrackedFiles',
                        status: yield this.dataSource.cleanUntrackedFiles(msg.repo, msg.directories)
                    });
                    break;
                case 'commitDetails':
                    this.sendMessage({
                        command: 'commitDetails',
                        commitDetails: yield (msg.commitHash !== utils_1.UNCOMMITTED ? this.dataSource.commitDetails(msg.repo, msg.commitHash) : this.dataSource.uncommittedDetails(msg.repo))
                    });
                    break;
                case 'compareCommits':
                    this.sendMessage({
                        command: 'compareCommits',
                        commitHash: msg.commitHash, compareWithHash: msg.compareWithHash,
                        fileChanges: yield this.dataSource.compareCommits(msg.repo, msg.fromHash, msg.toHash)
                    });
                    break;
                case 'copyToClipboard':
                    this.sendMessage({
                        command: 'copyToClipboard',
                        type: msg.type,
                        success: yield utils_1.copyToClipboard(msg.data)
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
                case 'deleteRemoteBranch':
                    this.sendMessage({
                        command: 'deleteRemoteBranch',
                        status: yield this.dataSource.deleteRemoteBranch(msg.repo, msg.branchName, msg.remote)
                    });
                    break;
                case 'deleteTag':
                    this.sendMessage({
                        command: 'deleteTag',
                        status: yield this.dataSource.deleteTag(msg.repo, msg.tagName)
                    });
                    break;
                case 'fetch':
                    this.sendMessage({
                        command: 'fetch',
                        status: yield this.dataSource.fetch(msg.repo)
                    });
                    break;
                case 'fetchAvatar':
                    this.avatarManager.fetchAvatarImage(msg.email, msg.repo, msg.commits);
                    break;
                case 'loadBranches':
                    let branchData = yield this.dataSource.getBranches(msg.repo, msg.showRemoteBranches), isRepo = true;
                    if (branchData.error) {
                        isRepo = yield this.dataSource.isGitRepository(msg.repo);
                    }
                    this.sendMessage({
                        command: 'loadBranches',
                        branches: branchData.branches,
                        head: branchData.head,
                        hard: msg.hard,
                        isRepo: isRepo
                    });
                    if (msg.repo !== this.currentRepo) {
                        this.currentRepo = msg.repo;
                        this.extensionState.setLastActiveRepo(msg.repo);
                        this.repoFileWatcher.start(msg.repo);
                    }
                    break;
                case 'loadCommits':
                    this.sendMessage(Object.assign({ command: 'loadCommits' }, yield this.dataSource.getCommits(msg.repo, msg.branches, msg.maxCommits, msg.showRemoteBranches), { hard: msg.hard }));
                    break;
                case 'loadRepos':
                    if (!msg.check || !(yield this.repoManager.checkReposExist())) {
                        this.respondLoadRepos(this.repoManager.getRepos(), null);
                    }
                    break;
                case 'mergeBranch':
                    this.sendMessage({
                        command: 'mergeBranch',
                        status: yield this.dataSource.mergeBranch(msg.repo, msg.branchName, msg.createNewCommit, msg.squash)
                    });
                    break;
                case 'mergeCommit':
                    this.sendMessage({
                        command: 'mergeCommit',
                        status: yield this.dataSource.mergeCommit(msg.repo, msg.commitHash, msg.createNewCommit, msg.squash)
                    });
                    break;
                case 'pushTag':
                    this.sendMessage({
                        command: 'pushTag',
                        status: yield this.dataSource.pushTag(msg.repo, msg.tagName)
                    });
                    break;
                case 'rebaseOn':
                    this.sendMessage({
                        command: 'rebaseOn', type: msg.type, interactive: msg.interactive,
                        status: yield this.dataSource.rebaseOn(msg.repo, msg.base, msg.type, msg.ignoreDate, msg.interactive)
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
                case 'saveRepoState':
                    this.repoManager.setRepoState(msg.repo, msg.state);
                    break;
                case 'viewDiff':
                    this.sendMessage({
                        command: 'viewDiff',
                        success: yield utils_1.viewDiff(msg.repo, msg.fromHash, msg.toHash, msg.oldFilePath, msg.newFilePath, msg.type)
                    });
                    break;
                case 'viewScm':
                    this.sendMessage({
                        command: 'viewScm',
                        success: yield utils_1.viewScm()
                    });
                    break;
            }
            this.repoFileWatcher.unmute();
        }), null, this.disposables);
    }
    static createOrShow(extensionPath, dataSource, extensionState, avatarManager, repoManager, loadRepo) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (GitGraphView.currentPanel) {
            if (GitGraphView.currentPanel.isPanelVisible) {
                if (loadRepo !== null && loadRepo !== GitGraphView.currentPanel.currentRepo) {
                    GitGraphView.currentPanel.loadRepo = loadRepo;
                    GitGraphView.currentPanel.respondLoadRepos(repoManager.getRepos(), loadRepo);
                }
            }
            else {
                GitGraphView.currentPanel.loadRepo = loadRepo;
            }
            GitGraphView.currentPanel.panel.reveal(column);
        }
        else {
            GitGraphView.currentPanel = new GitGraphView(extensionPath, dataSource, extensionState, avatarManager, repoManager, loadRepo, column);
        }
    }
    sendMessage(msg) {
        this.panel.webview.postMessage(msg);
    }
    dispose() {
        GitGraphView.currentPanel = undefined;
        this.panel.dispose();
        this.avatarManager.deregisterView();
        this.repoFileWatcher.stop();
        this.repoManager.deregisterViewCallback();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x)
                x.dispose();
        }
    }
    update() {
        this.panel.webview.html = this.getHtmlForWebview();
    }
    getHtmlForWebview() {
        const config = config_1.getConfig(), nonce = getNonce();
        const viewState = {
            autoCenterCommitDetailsView: config.autoCenterCommitDetailsView(),
            combineLocalAndRemoteBranchLabels: config.combineLocalAndRemoteBranchLabels(),
            commitDetailsViewLocation: config.commitDetailsViewLocation(),
            customBranchGlobPatterns: config.customBranchGlobPatterns(),
            dateFormat: config.dateFormat(),
            defaultColumnVisibility: config.defaultColumnVisibility(),
            fetchAvatars: config.fetchAvatars() && this.extensionState.isAvatarStorageAvailable(),
            graphColours: config.graphColours(),
            graphStyle: config.graphStyle(),
            initialLoadCommits: config.initialLoadCommits(),
            lastActiveRepo: this.extensionState.getLastActiveRepo(),
            loadMoreCommits: config.loadMoreCommits(),
            loadRepo: this.loadRepo,
            refLabelAlignment: config.refLabelAlignment(),
            repos: this.repoManager.getRepos(),
            showCurrentBranchByDefault: config.showCurrentBranchByDefault()
        };
        let body, numRepos = Object.keys(viewState.repos).length, colorVars = '', colorParams = '';
        for (let i = 0; i < viewState.graphColours.length; i++) {
            colorVars += '--git-graph-color' + i + ':' + viewState.graphColours[i] + '; ';
            colorParams += '[data-color="' + i + '"]{--git-graph-color:var(--git-graph-color' + i + ');} ';
        }
        if (numRepos > 0) {
            body = `<body style="${colorVars}">
			<div id="view">
				<div id="controls">
					<span id="repoControl"><span class="unselectable">Repo: </span><div id="repoSelect" class="dropdown"></div></span>
					<span id="branchControl"><span class="unselectable">Branches: </span><div id="branchSelect" class="dropdown"></div></span>
					<label id="showRemoteBranchesControl"><input type="checkbox" id="showRemoteBranchesCheckbox" value="1" checked>Show Remote Branches</label>
					<div id="fetchBtn" title="Fetch from Remote(s)"></div>
					<div id="refreshBtn" title="Refresh"></div>
				</div>
				<div id="content">
					<div id="commitGraph"></div>
					<div id="commitTable"></div>
				</div>
				<div id="footer"></div>
				<ul id="contextMenu"></ul>
			</div>
			<div id="dockedCommitDetailsView"></div>
			<div id="dialogBacking"></div>
			<div id="dialog"></div>
			<div id="scrollShadow"></div>
			<script nonce="${nonce}">var viewState = ${JSON.stringify(viewState)};</script>
			<script src="${this.getMediaUri('out.min.js')}"></script>
			</body>`;
        }
        else {
            body = `<body class="unableToLoad" style="${colorVars}">
			<h2>Unable to load Git Graph</h2>
			<p>Either the current workspace does not contain a Git repository, or the Git executable could not be found.</p>
			<p>If you are using a portable Git installation, make sure you have set the Visual Studio Code Setting "git.path" to the path of your portable installation (e.g. "C:\\Program Files\\Git\\bin\\git.exe" on Windows).</p>
			</body>`;
        }
        this.isGraphViewLoaded = numRepos > 0;
        this.loadRepo = null;
        return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src vscode-resource: 'unsafe-inline'; script-src vscode-resource: 'nonce-${nonce}'; img-src data:;">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link rel="stylesheet" type="text/css" href="${this.getMediaUri('out.min.css')}">
				<title>Git Graph</title>
				<style>${colorParams}</style>
			</head>
			${body}
		</html>`;
    }
    getMediaUri(file) {
        return this.getUri('media', file).with({ scheme: 'vscode-resource' });
    }
    getUri(...pathComps) {
        return vscode.Uri.file(path.join(this.extensionPath, ...pathComps));
    }
    respondLoadRepos(repos, loadRepo) {
        this.sendMessage({
            command: 'loadRepos',
            repos: repos,
            lastActiveRepo: this.extensionState.getLastActiveRepo(),
            loadRepo: loadRepo
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