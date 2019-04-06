'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const StashGit_1 = require("./StashGit");
const StashNode_1 = require("./StashNode");
const StashNodeFactory_1 = require("./StashNodeFactory");
class Model {
    constructor() {
        this.stashGit = new StashGit_1.default();
        this.stashNodeFactory = new StashNodeFactory_1.default();
    }
    /**
     * Gets the raw git stash command data.
     */
    get raw() {
        return this.stashGit.getRawStash().then((rawData) => {
            return rawData;
        });
    }
    /**
     * Gets the roots list.
     */
    get roots() {
        return this.stashGit.getStashList().then((rawList) => {
            const list = [];
            rawList.forEach((stashListItem) => {
                list.push(this.stashNodeFactory.entryToNode(stashListItem));
            });
            return list;
        });
    }
    /**
     * Gets the stashed files of a stash entry.
     *
     * @param node the parent entry
     */
    getFiles(node) {
        return this.stashGit.getStashedFiles(node.index).then((stashedFiles) => {
            const list = [];
            const path = this.stashGit.root;
            stashedFiles.modified.forEach((stashFile) => {
                list.push(this.stashNodeFactory.fileToNode(path, stashFile, node, StashNode_1.NodeType.Modified));
            });
            stashedFiles.untracked.forEach((stashFile) => {
                list.push(this.stashNodeFactory.fileToNode(path, stashFile, node, StashNode_1.NodeType.Untracked));
            });
            stashedFiles.indexAdded.forEach((stashFile) => {
                list.push(this.stashNodeFactory.fileToNode(path, stashFile, node, StashNode_1.NodeType.IndexAdded));
            });
            stashedFiles.deleted.forEach((stashFile) => {
                list.push(this.stashNodeFactory.fileToNode(path, stashFile, node, StashNode_1.NodeType.Deleted));
            });
            return list;
        });
    }
    /**
     * Gets the file contents of both, the base (original) and the modified data.
     *
     * @param node the stashed file node
     */
    getStashedFile(node) {
        return node.isFile && node.type === StashNode_1.NodeType.Modified
            ? this.stashGit.getStashFileContents(node.parent.index, node.name)
                .then((rawContent) => {
                return rawContent;
            })
            : null;
    }
    /**
     * Gets the file contents of the untracked file.
     *
     * @param node the stashed node file
     */
    getUntrackedFile(node) {
        return node.isFile && node.type === StashNode_1.NodeType.Untracked
            ? this.stashGit.untrackedFileContents(node.parent.index, node.name).then((rawContent) => {
                return rawContent;
            })
            : null;
    }
    /**
     * Gets the file contents of the untracked file.
     *
     * @param node the stashed node file
     */
    getIndexAddedFile(node) {
        return node.isFile && node.type === StashNode_1.NodeType.IndexAdded
            ? this.stashGit.indexAddedFileContents(node.parent.index, node.name).then((rawContent) => {
                return rawContent;
            })
            : null;
    }
    /**
     * Gets the file contents of the deleted file.
     *
     * @param node the stashed node file
     */
    getDeletedFile(node) {
        return node.isFile && node.type === StashNode_1.NodeType.Deleted
            ? this.stashGit.deletedFileContents(node.parent.index, node.name).then((rawContent) => {
                return rawContent;
            })
            : null;
    }
}
exports.default = Model;
//# sourceMappingURL=Model.js.map