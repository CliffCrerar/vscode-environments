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
const SolidBucket = require("solid-bucket");
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
}
exports.TreeNode = TreeNode;
class FolderTreeNode extends TreeNode {
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.children;
        });
    }
}
function placeNode(root, path) {
    const parts = path.split("/");
    const fn = parts.pop();
    const account = root instanceof AccountTreeNode ? root : root.account;
    if (parts.length === 0) {
        const newFn = `${root.fullPath}/${fn}`;
        root.children.push(new TreeNode(fn, newFn, account));
    }
    else {
        const foundNode = root.children.find(x => x.name === parts[0]);
        if (foundNode) {
            placeNode(foundNode, parts
                .slice(1)
                .concat([fn])
                .join("/"));
        }
        else {
            const newFn = `${root.fullPath}/${parts[0]}`;
            const newRoot = new FolderTreeNode(parts[0], newFn, account);
            newRoot.children = [];
            root.children.push(newRoot);
            placeNode(newRoot, parts
                .slice(1)
                .concat([fn])
                .join("/"));
        }
    }
}
class AccountTreeNode extends FolderTreeNode {
    constructor(name, provider, parameters, bucketName) {
        super(name, `bucket://${name}`, undefined);
        this.bucketName = bucketName;
        this.client = new SolidBucket(provider, parameters);
    }
    nodeByUri(uri) {
        function finder(root) {
            console.log("checking node", root.fullPath, "against", uri.toString());
            if (root instanceof AccountTreeNode || root instanceof FolderTreeNode) {
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
            try {
                const resp = yield this.client.getListOfObjectsFromBucket(this.bucketName);
                if (resp.status !== 200) {
                    throw new Error(resp);
                }
                this.children = [];
                resp.data.forEach(path => placeNode(this, path.filename));
                return this.children;
            }
            catch (resp) {
                console.log(resp.message);
            }
        });
    }
    sort(nodes) {
        return nodes.sort((n1, n2) => {
            if (n1 instanceof FolderTreeNode && !(n2 instanceof FolderTreeNode)) {
                return -1;
            }
            if (!(n1 instanceof FolderTreeNode) && n2 instanceof FolderTreeNode) {
                return 1;
            }
            return n1.name.localeCompare(n2.name);
        });
    }
    getContent(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resp = yield this.client.getObjectFromBucket(this.bucketName, resource.path.startsWith("/") ? resource.path.substr(1) : resource.path);
                if (resp.status !== 200) {
                    throw Error(resp);
                }
                return resp.data;
            }
            catch (resp) {
                console.log(resp.message);
            }
        });
    }
}
class BucketTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.accounts = [
            new AccountTreeNode("myacc", "aws", {
                accessKeyId: "AKIAI5X5BSRJV5Q7EKEQ",
                secretAccessKey: "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",
                region: "us-east-1" // Optional: "us-east-1" by default
            }, "ureleymachine")
        ];
    }
    getTreeItem(element) {
        return {
            label: element.name,
            resourceUri: element.resource,
            collapsibleState: element instanceof FolderTreeNode
                ? vscode_1.TreeItemCollapsibleState.Collapsed
                : vscode_1.TreeItemCollapsibleState.None,
            command: element instanceof FolderTreeNode
                ? void 0
                : {
                    command: "openS3Resource",
                    arguments: [element],
                    title: "Open FTP Resource"
                }
        };
    }
    nodeByUri(uri) {
        for (let i = 0; i < this.accounts.length; i++) {
            const node = this.accounts[i].nodeByUri(uri);
            if (node)
                return node;
        }
        return undefined;
    }
    getChildren(element) {
        if (!element) {
            return this.accounts;
        }
        return element.getChildren();
    }
    provideTextDocumentContent(uri, token) {
        const node = this.nodeByUri(uri);
        return node.account.getContent(uri);
    }
}
exports.BucketTreeDataProvider = BucketTreeDataProvider;
//# sourceMappingURL=s3Explorer.js.map