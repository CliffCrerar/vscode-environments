"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const accountNode_1 = require("./accountNode");
const folderNode_1 = require("./folderNode");
class TreeNode {
    constructor(name, fullPath, account) {
        this.name = name;
        this.fullPath = fullPath;
        this.account = account;
        this._resource = vscode_1.Uri.parse(fullPath);
    }
    get resource() {
        return this._resource;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    static sortedNodes(nodes) {
        return nodes.sort((n1, n2) => {
            if (n1 instanceof folderNode_1.FolderTreeNode && !(n2 instanceof folderNode_1.FolderTreeNode)) {
                return -1;
            }
            if (!(n1 instanceof folderNode_1.FolderTreeNode) && n2 instanceof folderNode_1.FolderTreeNode) {
                return 1;
            }
            return n1.name.localeCompare(n2.name);
        });
    }
    static placeNode(root, path) {
        const parts = path.split("/");
        const fn = parts.pop();
        const account = root instanceof accountNode_1.AccountTreeNode ? root : root.account;
        if (parts.length === 0) {
            const newFn = `${root.fullPath}/${fn}`;
            root.children.push(new TreeNode(fn, newFn, account));
        }
        else {
            const foundNode = root.children.find(x => x.name === parts[0]);
            if (foundNode) {
                TreeNode.placeNode(foundNode, parts
                    .slice(1)
                    .concat([fn])
                    .join("/"));
            }
            else {
                const newFn = `${root.fullPath}/${parts[0]}`;
                const newRoot = new folderNode_1.FolderTreeNode(parts[0], newFn, account);
                newRoot.children = [];
                root.children.push(newRoot);
                TreeNode.placeNode(newRoot, parts
                    .slice(1)
                    .concat([fn])
                    .join("/"));
            }
        }
    }
}
exports.TreeNode = TreeNode;
//# sourceMappingURL=treeNode.js.map