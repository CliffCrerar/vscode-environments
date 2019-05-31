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
     * @param fileNode
     */
    display(fileNode) {
        if (fileNode.type === StashNode_1.NodeType.Modified) {
            this.model.getStashedFile(fileNode).then((files) => {
                this.showDiff(this.getResourceAsUri(files.base, fileNode), this.getResourceAsUri(files.modified, fileNode), fileNode, true);
            });
        }
        else if (fileNode.type === StashNode_1.NodeType.Untracked) {
            this.model.getFileContents(fileNode).then((content) => {
                this.showDiff(this.getResourceAsUri(), this.getResourceAsUri(content, fileNode), fileNode, true);
            });
        }
        else if (fileNode.type === StashNode_1.NodeType.IndexAdded) {
            this.model.getFileContents(fileNode).then((content) => {
                this.showDiff(this.getResourceAsUri(), this.getResourceAsUri(content, fileNode), fileNode, true);
            });
        }
        else if (fileNode.type === StashNode_1.NodeType.Deleted) {
            this.model.getFileContents(fileNode).then((content) => {
                this.showDiff(this.getResourceAsUri(content, fileNode), this.getResourceAsUri(), fileNode, true);
            });
        }
    }
    /**
     * Shows a stashed file diff document.
     *
     * @param fileNode
     */
    diffCurrent(fileNode) {
        const current = fileNode.path;
        if (!fs.existsSync(current)) {
            vscode.window.showErrorMessage('No file available to compare');
            return;
        }
        if (fileNode.type === StashNode_1.NodeType.Modified) {
            this.model.getStashedFile(fileNode).then((files) => {
                this.showDiff(this.getResourceAsUri(files.modified, fileNode), vscode.Uri.file(current), fileNode, false);
            });
        }
        else if (fileNode.type === StashNode_1.NodeType.Untracked) {
            this.model.getFileContents(fileNode).then((content) => {
                this.showDiff(this.getResourceAsUri(content, fileNode), vscode.Uri.file(current), fileNode, false);
            });
        }
        else if (fileNode.type === StashNode_1.NodeType.IndexAdded) {
            this.model.getFileContents(fileNode).then((content) => {
                this.showDiff(this.getResourceAsUri(content, fileNode), vscode.Uri.file(current), fileNode, false);
            });
        }
        else if (fileNode.type === StashNode_1.NodeType.Deleted) {
            this.model.getFileContents(fileNode).then((content) => {
                this.showDiff(this.getResourceAsUri(content, fileNode), vscode.Uri.file(current), fileNode, false);
            });
        }
    }
    /**
     * Shows the diff view with the specified files.
     *
     * @param base     the resource uri of the file prior the modification
     * @param modified the resource uri of the file after the modification
     * @param fileNode the stash node that's being displayed
     * @param hint     the hint reference to know file origin
     */
    showDiff(base, modified, fileNode, hint) {
        vscode.commands.executeCommand('vscode.diff', base, modified, this.stashLabels.getDiffTitle(fileNode, hint), { preview: true });
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