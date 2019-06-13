"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const accountNode_1 = require("./nodes/accountNode");
const folderNode_1 = require("./nodes/folderNode");
const treeNode_1 = require("./nodes/treeNode");
class BucketTreeDataProvider {
    constructor(context) {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.accounts = [];
        context.subscriptions.push(this.startOnConfigurationChangeWatcher());
        this.processConfig();
    }
    get onDidChangeTreeData() {
        return this._onDidChangeTreeData.event;
    }
    processConfig() {
        const conf = vscode_1.workspace.getConfiguration("bucketExplorer");
        const enabled = conf.get("enabled", true);
        vscode_1.commands.executeCommand("setContext", "bucketExplorer:enabled", enabled);
        this.accounts = conf.get("buckets", []).map(b => {
            return new accountNode_1.AccountTreeNode(`${b.provider}/${b.name}`, b.provider, b.configuration, b.name);
        });
        this._onDidChangeTreeData.fire();
    }
    startOnConfigurationChangeWatcher() {
        return vscode_1.workspace.onDidChangeConfiguration((params) => {
            if (params.affectsConfiguration("bucketExplorer"))
                this.processConfig();
        });
    }
    getTreeItem(element) {
        return {
            label: element.name,
            resourceUri: element.resource,
            collapsibleState: element instanceof folderNode_1.FolderTreeNode
                ? vscode_1.TreeItemCollapsibleState.Collapsed
                : vscode_1.TreeItemCollapsibleState.None,
            command: element instanceof folderNode_1.FolderTreeNode
                ? void 0
                : {
                    command: "openBucketResource",
                    arguments: [element],
                    title: "Open Bucket Item"
                }
        };
    }
    nodeByUri(uri) {
        for (let i = 0; i < this.accounts.length; i++) {
            const node = this.accounts[i].nodeByUri(uri);
            if (node)
                return node;
        }
        return undefined;
    }
    refresh() {
        for (let i = 0; i < this.accounts.length; i++) {
            this.accounts[i].children = null;
        }
        this._onDidChangeTreeData.fire();
    }
    getChildren(element) {
        return !element ? treeNode_1.TreeNode.sortedNodes(this.accounts) : element.getChildren();
    }
    provideTextDocumentContent(uri, token) {
        const node = this.nodeByUri(uri);
        return node.account.getContent(uri);
    }
}
exports.BucketTreeDataProvider = BucketTreeDataProvider;
//# sourceMappingURL=bucketExplorer.js.map