'use string';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const vscode = require("vscode");
const StashNode_1 = require("./StashNode");
class DiffDisplayer {
    constructor(model, stashLabels) {
        this.model = model;
        this.stashLabels = stashLabels;
        tmp.setGracefulCleanup();
    }
    /**
     * Shows a stashed file diff document.
     *
     * @param node
     */
    display(node) {
        if (node.type === StashNode_1.NodeType.Modified) {
            this.model.getStashedFile(node).then((files) => {
                this.showDiff(this.getResourceAsUri(files.base, node), this.getResourceAsUri(files.modified, node), node);
            });
        }
        else if (node.type === StashNode_1.NodeType.Untracked) {
            this.model.getUntrackedFile(node).then((content) => {
                this.showDiff(this.getResourceAsUri(), this.getResourceAsUri(content, node), node);
            });
        }
        else if (node.type === StashNode_1.NodeType.IndexAdded) {
            this.model.getIndexAddedFile(node).then((content) => {
                this.showDiff(this.getResourceAsUri(), this.getResourceAsUri(content, node), node);
            });
        }
        else if (node.type === StashNode_1.NodeType.Deleted) {
            this.model.getDeletedFile(node).then((content) => {
                this.showDiff(this.getResourceAsUri(content, node), this.getResourceAsUri(), node);
            });
        }
    }
    /**
     * Shows a stashed file diff document.
     *
     * @param node
     */
    diffCurrent(node) {
        const current = node.path;
        if (!current) {
            vscode.window.showErrorMessage('No file available to compare');
            return;
        }
        if (node.type === StashNode_1.NodeType.Modified) {
            this.model.getStashedFile(node).then((files) => {
                this.showDiff(this.getResourceAsUri(files.modified, node), vscode.Uri.file(current), node);
            });
        }
        else if (node.type === StashNode_1.NodeType.Untracked) {
            this.model.getUntrackedFile(node).then((content) => {
                this.showDiff(this.getResourceAsUri(content, node), vscode.Uri.file(current), node);
            });
        }
        else if (node.type === StashNode_1.NodeType.IndexAdded) {
            this.model.getIndexAddedFile(node).then((content) => {
                this.showDiff(this.getResourceAsUri(content, node), vscode.Uri.file(current), node);
            });
        }
        else if (node.type === StashNode_1.NodeType.Deleted) {
            this.model.getDeletedFile(node).then((content) => {
                this.showDiff(this.getResourceAsUri(content, node), vscode.Uri.file(current), node);
            });
        }
    }
    /**
     * Shows the diff view with the specified files.
     *
     * @param base     the resource uri of the file prior the modification
     * @param modified the resource uri of the file after the modification
     * @param node     the stash node that's being displayed
     */
    showDiff(base, modified, node) {
        vscode.commands.executeCommand('vscode.diff', base, modified, this.stashLabels.getDiffTitle(node), { preview: true });
    }
    /**
     * Generates a resource uri for the resource content.
     *
     * @param content the resource content
     * @param node    the stash node that's being displayed
     */
    getResourceAsUri(content, node) {
        return content
            ? vscode.Uri.file(this.createTmpFile(content, node.name).name)
            : vscode.Uri.parse('empty-stash:');
    }
    /**
     * Generates a file with content.
     *
     * @param content  the buffer with the content
     * @param filename the string with the filename
     */
    createTmpFile(content, filename) {
        const file = tmp.fileSync({
            prefix: 'vscode-gitstash-',
            postfix: path.extname(filename)
        });
        fs.writeFileSync(file.name, content);
        return file;
    }
}
exports.DiffDisplayer = DiffDisplayer;
//# sourceMappingURL=DiffDisplayer.js.map