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
const storageManagementClient = require("azure-arm-storage");
const path = require("path");
const vscode = require("vscode");
const storageAccountNode_1 = require("./storageAccountNode");
class SubscriptionNode {
    constructor(azureResourceFilter) {
        this.azureResourceFilter = azureResourceFilter;
    }
    getTreeItem() {
        return {
            label: this.azureResourceFilter.subscription.displayName,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "subscription",
            iconPath: path.join(__filename, "..", "..", "..", "..", "resources", "AzureSubscription_16x.png"),
        };
    }
    getChildren(azureAccount) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new storageManagementClient(this.azureResourceFilter.session.credentials, this.azureResourceFilter.subscription.subscriptionId);
            const nodes = yield client.storageAccounts.list().then((storageAccounts) => {
                return storageAccounts.map((storageAccount) => __awaiter(this, void 0, void 0, function* () {
                    const storageAccountKeys = yield client.storageAccounts.listKeys(this.getResourceGroupNameById(storageAccount.id), storageAccount.name).then((_storageAccountKeys) => {
                        return _storageAccountKeys.keys;
                    });
                    return new storageAccountNode_1.StorageAccountNode(storageAccount, storageAccountKeys);
                }));
            });
            return Promise.all(nodes).then((_nodes) => {
                return _nodes;
            });
        });
    }
    getResourceGroupNameById(id) {
        const result = /\/resourceGroups\/([^/]+)\//.exec(id);
        return result ? result[1] : "";
    }
}
exports.SubscriptionNode = SubscriptionNode;
//# sourceMappingURL=subscriptionNode.js.map