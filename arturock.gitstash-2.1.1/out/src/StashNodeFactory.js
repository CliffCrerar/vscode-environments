'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const StashNode_1 = require("./StashNode");
class default_1 {
    /**
     * Generates a repository node.
     *
     * @param path the repository path
     */
    createRepositoryNode(path) {
        return new StashNode_1.default({
            type: StashNode_1.NodeType.Repository,
            name: vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(path)).name,
            index: null,
            parent: null,
            date: null,
            path: path
        });
    }
    /**
     * Generates a stash node.
     *
     * @param stash the stash to use as base
     */
    createStashNode(stash, parentNode) {
        return new StashNode_1.default({
            type: StashNode_1.NodeType.Stash,
            name: stash.description,
            index: stash.index,
            parent: parentNode,
            date: stash.date
        });
    }
    /**
     * Generates a file node.
     *
     * @param path       the file path
     * @param file       the file name
     * @param parentNode the parent node
     * @param type       the stash type
     */
    createFileNode(path, file, parentNode, type) {
        return new StashNode_1.default({
            type: type,
            name: file,
            path: path,
            index: null,
            parent: parentNode,
            date: parentNode.date
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=StashNodeFactory.js.map