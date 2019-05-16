"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const astTypes = require("ast-types");
const jscodeshift = require("jscodeshift");
function isPositionWithinNode(position, node) {
    return node.start <= position && position < node.end;
}
function createCollection(nodeOrPathOrArray) {
    return jscodeshift(nodeOrPathOrArray);
}
function registerCollectionExtensions(j) {
    j.registerMethods({
        firstNode() {
            return this.nodes()[0] || null;
        },
        firstPath() {
            return this.paths()[0] || null;
        },
        parents() {
            return this.thisAndParents().slice(1);
        },
        thisAndParents() {
            if (this.length > 1) {
                throw new Error('The operation is only available for single-node collections.');
            }
            const path = this.firstPath();
            if (!path) {
                return [];
            }
            const result = [path.node];
            let parent = path.parent;
            while (parent) {
                result.push(parent.node);
                parent = parent.parent;
            }
            return result;
        },
        findNodeAtPosition(pos) {
            const path = this.firstPath();
            if (!path) {
                return createCollection([]);
            }
            let targets = [];
            let r = astTypes.visit(path, {
                visitNode(p) {
                    if (isPositionWithinNode(pos, p.node)) {
                        targets.push(p);
                        this.traverse(p);
                        return;
                    }
                    else {
                        return false;
                    }
                }
            });
            const last = targets[targets.length - 1];
            return createCollection(last || []);
        },
        findNodeInRange(start, end) {
            if (start > end) {
                [start, end] = [end, start];
            }
            const path = this.firstPath();
            if (!path) {
                return createCollection([]);
            }
            let targets = [];
            let r = astTypes.visit(path, {
                visitNode(p) {
                    const n = p.node;
                    if (n.start <= start && end <= n.end) {
                        targets.push(p);
                        this.traverse(p);
                        return;
                    }
                    else {
                        return false;
                    }
                }
            });
            const last = targets[targets.length - 1];
            return createCollection(last || []);
        },
        thisOrClosest(type, filter) {
            return this.map(path => {
                let target = path;
                while (target &&
                    !(type.check(target.value) && (!filter || j.match(target.value, filter)))) {
                    target = target.parent;
                }
                return target || null;
            });
        },
        furthest(type, filter) {
            return this.map(path => {
                let furthestPath = null;
                let target = path.parent;
                while (target) {
                    if (type.check(target.value) && (!filter || j.match(target.value, filter))) {
                        furthestPath = target;
                    }
                    target = target.parent;
                }
                return furthestPath;
            });
        }
    });
}
exports.registerCollectionExtensions = registerCollectionExtensions;
//# sourceMappingURL=collectionExtensions.js.map