'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
const StashNode_1 = require("./StashNode");
class GitStashTreeDataProvider {
    constructor(config, model, stashLabels) {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        /**
         * Reloads the explorer tree.
         */
        this.refresh = () => {
            this.reload('force');
        };
        /**
         * Toggles the explorer tree.
         */
        this.toggle = () => {
            this.showExplorer = typeof this.showExplorer === 'undefined'
                ? this.config.settings.explorer.enabled
                : !this.showExplorer;
            vscode_1.commands.executeCommand('setContext', 'gitstash.explorer.enabled', this.showExplorer);
        };
        this.config = config;
        this.model = model;
        this.stashLabels = stashLabels;
    }
    /**
     * Gets the tree children, (root) stash entries, or entry files.
     *
     * @param node If specified, return the files list, if not, the stash list
     */
    getChildren(node) {
        if (!node) {
            this.model.raw.then((rawStash) => {
                this.rawStash = rawStash;
            });
            return this.model.roots;
        }
        return this.model.getFiles(node);
    }
    /**
     * Generates a tree item for the specified node.
     *
     * @param node The node to be used as base
     */
    getTreeItem(node) {
        return node.isFile
            ? this.getFileItem(node)
            : this.getEntryItem(node);
    }
    /**
     * Reloads the git stash tree view.
     *
     * @param type the event type
     * @param event The event file URI
     */
    reload(type, event) {
        if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
        }
        this.loadTimeout = setTimeout((type, event) => {
            if (['settings', 'force'].indexOf(type) !== -1) {
                this._onDidChangeTreeData.fire();
            }
            else {
                this.model.raw.then((rawStash) => {
                    if (this.rawStash !== rawStash) {
                        this.rawStash = rawStash;
                        this._onDidChangeTreeData.fire();
                    }
                });
            }
        }, type === 'force' ? 250 : 750, type, event);
    }
    /**
     * Generates an stash tree item.
     *
     * @param node The node to be used as base
     */
    getEntryItem(node) {
        return {
            label: this.stashLabels.getEntryName(node),
            tooltip: this.stashLabels.getEntryTooltip(node),
            iconPath: this.getIcon('chest.svg'),
            contextValue: 'diffEntry',
            collapsibleState: vscode_1.TreeItemCollapsibleState.Collapsed,
            command: void 0
        };
    }
    /**
     * Generates a stashed file tree item.
     *
     * @param node The node to be used as base
     */
    getFileItem(node) {
        let context = 'diffFile';
        switch (node.type) {
            case (StashNode_1.NodeType.Deleted):
                context += ':deleted';
                break;
            case (StashNode_1.NodeType.Modified):
                context += ':modified';
                break;
            case (StashNode_1.NodeType.Untracked):
                context += ':untracked';
                break;
            case (StashNode_1.NodeType.IndexAdded):
                context += ':indexAdded';
                break;
        }
        return {
            label: this.stashLabels.getFileName(node),
            tooltip: this.stashLabels.getFileTooltip(node),
            iconPath: this.getFileIcon(node.type),
            contextValue: context,
            collapsibleState: void 0,
            command: {
                title: 'Show stash diff',
                command: 'gitstash.show',
                arguments: [node]
            }
        };
    }
    /**
     * Builds an icon path.
     *
     * @param filename The filename of the icon
     */
    getIcon(filename) {
        return {
            light: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'light', filename),
            dark: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'dark', filename)
        };
    }
    /**
     * Builds a file icon path.
     *
     * @param filename The filename of the icon
     */
    getFileIcon(type) {
        switch (type) {
            case StashNode_1.NodeType.Modified: return this.getIcon('status-modified.svg');
            case StashNode_1.NodeType.Untracked: return this.getIcon('status-untracked.svg');
            case StashNode_1.NodeType.IndexAdded: return this.getIcon('status-added.svg');
            case StashNode_1.NodeType.Deleted: return this.getIcon('status-deleted.svg');
            default: return vscode_1.ThemeIcon.File;
        }
    }
}
exports.default = GitStashTreeDataProvider;
//# sourceMappingURL=GitStashTreeDataProvider.js.map