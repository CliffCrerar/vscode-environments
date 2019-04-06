'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const StashNode_1 = require("./StashNode");
class default_1 {
    /**
     * Generates a node from a stash entry.
     *
     *@param entry The stash entry to use as base.
     */
    entryToNode(entry) {
        return new StashNode_1.default({
            type: StashNode_1.NodeType.Entry,
            name: entry.description,
            index: entry.index,
            parent: null,
            date: entry.date
        });
    }
    /**
     * Generates a node from a stashed file.
     *
     * @param path       the file path
     * @param file       the file name
     * @param parentNode the parent node
     * @param type       the stash type
     */
    fileToNode(path, file, parentNode, type) {
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