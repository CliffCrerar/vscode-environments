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
     * Gets the raw git stashes list.
     */
    getRawStashesList(cwd) {
        return this.stashGit.getRawStash(cwd).then((rawData) => {
            return rawData;
        });
    }
    /**
     * Gets the repositories list.
     */
    getRepositories() {
        return this.stashGit.getRepositories().then((rawList) => {
            const repositoryNodes = [];
            rawList.forEach((repositoryPath) => {
                repositoryNodes.push(this.stashNodeFactory.createRepositoryNode(repositoryPath));
            });
            return repositoryNodes;
        });
    }
    /**
     * Gets the stashes list.
     */
    getStashes(repositoryNode) {
        return this.stashGit.getStashes(repositoryNode.path).then((rawList) => {
            const stashNodes = [];
            rawList.forEach((stash) => {
                stashNodes.push(this.stashNodeFactory.createStashNode(stash, repositoryNode));
            });
            return stashNodes;
        });
    }
    /**
     * Gets the stash files.
     *
     * @param stashNode the parent stash
     */
    getFiles(stashNode) {
        return this.stashGit.getStashedFiles(stashNode.path, stashNode.index).then((stashedFiles) => {
            const fileNodes = [];
            const path = stashNode.path;
            stashedFiles.modified.forEach((stashFile) => {
                fileNodes.push(this.stashNodeFactory.createFileNode(path, stashFile, stashNode, StashNode_1.NodeType.Modified));
            });
            stashedFiles.untracked.forEach((stashFile) => {
                fileNodes.push(this.stashNodeFactory.createFileNode(path, stashFile, stashNode, StashNode_1.NodeType.Untracked));
            });
            stashedFiles.indexAdded.forEach((stashFile) => {
                fileNodes.push(this.stashNodeFactory.createFileNode(path, stashFile, stashNode, StashNode_1.NodeType.IndexAdded));
            });
            stashedFiles.deleted.forEach((stashFile) => {
                fileNodes.push(this.stashNodeFactory.createFileNode(path, stashFile, stashNode, StashNode_1.NodeType.Deleted));
            });
            return fileNodes;
        });
    }
    /**
     * Gets the file contents of both, the base (original) and the modified data.
     *
     * @param fileNode the stashed file node
     */
    getStashedFile(fileNode) {
        return this.stashGit.getStashFileContents(fileNode.parent.path, fileNode.parent.index, fileNode.name)
            .then((rawContent) => {
            return rawContent;
        });
    }
    /**
     * Gets the file contents of the untracked file.
     *
     * @param fileNode the stashed node file
     */
    getFileContents(fileNode) {
        switch (fileNode.type) {
            case StashNode_1.NodeType.Untracked:
                return this.stashGit.untrackedFileContents(fileNode.parent.path, fileNode.parent.index, fileNode.name)
                    .then((rawContent) => {
                    return rawContent;
                });
            case StashNode_1.NodeType.IndexAdded:
                return this.stashGit.indexAddedFileContents(fileNode.parent.path, fileNode.parent.index, fileNode.name)
                    .then((rawContent) => {
                    return rawContent;
                });
            case StashNode_1.NodeType.Deleted:
                return this.stashGit.deletedFileContents(fileNode.parent.path, fileNode.parent.index, fileNode.name)
                    .then((rawContent) => {
                    return rawContent;
                });
        }
    }
}
exports.default = Model;
//# sourceMappingURL=Model.js.map