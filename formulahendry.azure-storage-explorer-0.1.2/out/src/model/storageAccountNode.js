"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const blobContainerLabelNode_1 = require("./blob/blobContainerLabelNode");
const fileShareLabelNode_1 = require("./file/fileShareLabelNode");
const tableLabelNode_1 = require("./table/tableLabelNode");
class StorageAccountNode {
    constructor(storageAccount, storageAccountKeys) {
        this.storageAccount = storageAccount;
        this.storageAccountKeys = storageAccountKeys;
    }
    getTreeItem() {
        return {
            label: this.storageAccount.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "storageAccount",
            iconPath: path.join(__filename, "..", "..", "..", "..", "resources", "AzureStorageAccount_16x.png"),
        };
    }
    getChildren() {
        return [new blobContainerLabelNode_1.BlobContainerLabelNode(this.storageAccount, this.storageAccountKeys),
            new fileShareLabelNode_1.FileShareLabelNode(this.storageAccount, this.storageAccountKeys),
            new tableLabelNode_1.TableLabelNode(this.storageAccount, this.storageAccountKeys)];
    }
}
exports.StorageAccountNode = StorageAccountNode;
//# sourceMappingURL=storageAccountNode.js.map