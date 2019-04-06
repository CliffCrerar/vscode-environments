'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
var NodeType;
(function (NodeType) {
    NodeType["Entry"] = "e";
    NodeType["Untracked"] = "u";
    NodeType["IndexAdded"] = "a";
    NodeType["Modified"] = "m";
    NodeType["Deleted"] = "d";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
class StashNode {
    constructor(entry) {
        this.entry = entry;
    }
    /**
     * Gets the node type.
     */
    get type() {
        return this.entry.type;
    }
    /**
     * Gets the node name.
     */
    get name() {
        return this.entry.name;
    }
    /**
     * Gets the node index.
     */
    get index() {
        return this.entry.index;
    }
    /**
     * Gets the node parent index.
     */
    get parent() {
        return this.entry.parent;
    }
    /**
     * Gets the node generation date.
     */
    get date() {
        return this.entry.date;
    }
    /**
     * Indicates if the node represents a stashed file or not.
     */
    get isFile() {
        return this.entry.parent !== null;
    }
    /**
     * Gets the file path of the stashed file if exists.
     */
    get path() {
        if (!this.isFile) {
            return null;
        }
        const path = `${this.entry.path}/${this.name}`;
        return fs_1.existsSync(path) ? path : null;
    }
}
exports.default = StashNode;
//# sourceMappingURL=StashNode.js.map