'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var NodeType;
(function (NodeType) {
    NodeType["Repository"] = "r";
    NodeType["Stash"] = "s";
    NodeType["Untracked"] = "u";
    NodeType["IndexAdded"] = "a";
    NodeType["Modified"] = "m";
    NodeType["Deleted"] = "d";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
class StashNode {
    constructor(source) {
        this.source = source;
    }
    /**
     * Gets the node type.
     */
    get type() {
        return this.source.type;
    }
    /**
     * Gets the node name.
     */
    get name() {
        return this.source.name;
    }
    /**
     * Gets the node index.
     */
    get index() {
        return this.source.index;
    }
    /**
     * Gets the node parent index.
     */
    get parent() {
        return this.source.parent;
    }
    /**
     * Gets the node generation date.
     */
    get date() {
        return this.source.date;
    }
    /**
     * Indicates if the node represents a stashed file or not.
     */
    get isFile() {
        return [
            NodeType.Deleted,
            NodeType.IndexAdded,
            NodeType.Modified,
            NodeType.Untracked
        ].indexOf(this.type) > -1;
    }
    /**
     * Gets the file path of the stashed file if exists.
     */
    get path() {
        if (this.type === NodeType.Repository) {
            return this.source.path;
        }
        if (this.type === NodeType.Stash) {
            return this.source.parent.path;
        }
        if (this.isFile) {
            return `${this.source.path}/${this.name}`;
        }
        return null;
    }
}
exports.default = StashNode;
//# sourceMappingURL=StashNode.js.map