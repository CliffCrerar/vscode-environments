"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const ScriptTreeItem_1 = require("./ScriptTreeItem");
const WorkspaceTreeItem_1 = require("./WorkspaceTreeItem");
function getPackageJson(root) {
    return path.join(root, "package.json");
}
class NpmScriptsNodeProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this
            ._onDidChangeTreeData.event;
        vscode_1.workspace.workspaceFolders.forEach(folder => {
            const pattern = getPackageJson(folder.uri.path);
            this.fileWatcher = vscode_1.workspace.createFileSystemWatcher(pattern);
            this.fileWatcher.onDidChange(() => this.refresh());
        });
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return new Promise((resolve) => {
            const folders = vscode_1.workspace.workspaceFolders;
            if (element) {
                // Workspace render scripts
                const folder = folders.find(o => o.name === element.label);
                const packageJsonPath = path.join(folder.uri.fsPath, "package.json");
                this.renderSingleWorkspace(resolve, packageJsonPath);
            }
            else if (folders && folders.length > 1) {
                // Root render workspaces
                this.renderMultipleWorkspaces(resolve, folders);
            }
            else {
                // Root render scripts
                this.renderSingleWorkspace(resolve);
            }
        });
    }
    /**
     * Render tree items for multiple workspaces
     *
     * @private
     * @param {Function} resolve
     * @param {WorkspaceFolder[]} folders
     * @memberof ScriptNodeProvider
     */
    renderMultipleWorkspaces(resolve, folders) {
        resolve(this.mkTreeItemsForWorkspace(folders));
    }
    /**
     * Render tree items for a single project workspace
     *
     * @private
     * @param {any} element
     * @param {any} resolve
     * @memberof ScriptNodeProvider
     */
    renderSingleWorkspace(resolve, packageJsonPath) {
        if (!packageJsonPath) {
            packageJsonPath = getPackageJson(this.workspaceRoot);
        }
        if (this.pathExists(packageJsonPath)) {
            resolve(this.mkTreeItemsFromPackageScripts(packageJsonPath));
        }
        else {
            vscode.window.showInformationMessage("Workspace has no package.json");
            resolve([]);
        }
    }
    mkTreeItemsForWorkspace(folders) {
        const workspaceFolders = vscode_1.workspace.workspaceFolders;
        const treeItems = [];
        folders.forEach((folder) => {
            const workspaceRoot = folder.uri.fsPath;
            const packageJsonPath = getPackageJson(workspaceRoot);
            const name = folder.name;
            if (this.pathExists(packageJsonPath)) {
                treeItems.push(new WorkspaceTreeItem_1.WorkspaceTreeItem(name, vscode_1.TreeItemCollapsibleState.Collapsed, `${name} Workspace Folder`));
            }
        });
        return treeItems;
    }
    /**
     * Takes a path to project package.json, return a list of all keys
     * from the scripts section
     *
     * @private
     * @param {string} packageJsonPath
     * @returns {ScriptTreeItem[]}
     * @memberof ScriptNodeProvider
     */
    mkTreeItemsFromPackageScripts(packageJsonPath) {
        const treeItems = [];
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        const workspaceDir = path.dirname(packageJsonPath);
        const toScript = (scriptName, scriptCommand) => {
            const cmdObject = {
                title: "Run Script",
                command: "npmScripts.executeCommand",
                arguments: [scriptName, workspaceDir]
            };
            return new ScriptTreeItem_1.ScriptTreeItem(scriptName, vscode_1.TreeItemCollapsibleState.None, scriptCommand, cmdObject);
        };
        if (packageJson.scripts) {
            Object.keys(packageJson.scripts).forEach(key => {
                treeItems.push(toScript(key, packageJson.scripts[key]));
            });
        }
        return treeItems;
    }
    /**
     * Safely determine if a path exists on disk. (Safely, ie: Doesn't throw)
     *
     * @private
     * @param {string} p
     * @returns {boolean}
     * @memberof ScriptNodeProvider
     */
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
}
exports.NpmScriptsNodeProvider = NpmScriptsNodeProvider;
//# sourceMappingURL=npmScripts.js.map