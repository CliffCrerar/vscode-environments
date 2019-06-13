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
const solid_bucket_1 = require("../solid-bucket");
const folderNode_1 = require("./folderNode");
const treeNode_1 = require("./treeNode");
class AccountTreeNode extends folderNode_1.FolderTreeNode {
    constructor(name, provider, parameters, bucketName) {
        super(name, `bucket://${name}`, undefined);
        this.bucketName = bucketName;
        this.client = new solid_bucket_1.SolidBucket(provider, parameters);
    }
    nodeByUri(uri) {
        function finder(root) {
            if (root instanceof AccountTreeNode || root instanceof folderNode_1.FolderTreeNode) {
                for (let i = 0; i < root.children.length; i++) {
                    const node = finder(root.children[i]);
                    if (node) {
                        return node;
                    }
                }
            }
            else {
                if (root.resource.toString() === uri.toString()) {
                    return root;
                }
            }
            return undefined;
        }
        return finder(this);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.children)
                return this.children;
            return vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Window,
                title: "Listing..."
            }, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const resp = yield this.client.getListOfObjectsFromBucket(this.bucketName);
                    if (resp.status !== 200) {
                        throw new Error(resp);
                    }
                    this.children = [];
                    resp.data.forEach(path => treeNode_1.TreeNode.placeNode(this, path.filename));
                    return treeNode_1.TreeNode.sortedNodes(this.children);
                }
                catch (resp) {
                    throw new Error(resp.message);
                }
            }));
        });
    }
    getContent(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Window,
                title: "Downloading..."
            }, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const resp = yield this.client.getObjectFromBucket(this.bucketName, resource.path.startsWith("/" + this.bucketName)
                        ? resource.path.substr(("/" + this.bucketName).length + 1)
                        : resource.path);
                    if (resp.status !== 200) {
                        throw Error(resp);
                    }
                    return resp.data;
                }
                catch (resp) {
                    console.log(resp.message);
                }
            }));
        });
    }
}
exports.AccountTreeNode = AccountTreeNode;
//# sourceMappingURL=accountNode.js.map