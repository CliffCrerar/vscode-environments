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
const vscode = require("vscode");
const appInsightsClient_1 = require("./common/appInsightsClient");
const infoNode_1 = require("./model/infoNode");
const selectSubscriptionsNode_1 = require("./model/selectSubscriptionsNode");
const subscriptionNode_1 = require("./model/subscriptionNode");
const toSignInNode_1 = require("./model/toSignInNode");
class StorageTreeDataProvider {
    constructor(context) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.accountApi = vscode.extensions.getExtension("ms-vscode.azure-account").exports;
        this.accountApi.onFiltersChanged(this.onSubscriptionChanged, this);
        this.accountApi.onSessionsChanged(this.onSubscriptionChanged, this);
    }
    getTreeItem(element) {
        return element.getTreeItem();
    }
    getChildren(element) {
        if (this.accountApi.status === "Initializing" || this.accountApi.status === "LoggingIn") {
            return [new infoNode_1.InfoNode("Loading...")];
        }
        if (this.accountApi.status === "LoggedOut") {
            // vscode.commands.executeCommand("azure-account.login");
            return [new toSignInNode_1.ToSignInNode()];
        }
        if (!element) {
            return this.getSubscriptions();
        }
        return element.getChildren(this.accountApi);
    }
    refresh(element) {
        this._onDidChangeTreeData.fire(element);
    }
    getSubscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.accountApi.waitForFilters();
            if (this.accountApi.filters.length === 0) {
                return [new selectSubscriptionsNode_1.SelectSubscriptionsNode()];
            }
            const azureResourceFilters = yield this.accountApi.filters;
            const nodes = azureResourceFilters.map((azureResourceFilter) => {
                return new subscriptionNode_1.SubscriptionNode(azureResourceFilter);
            });
            appInsightsClient_1.AppInsightsClient.sendEvent("loadSubscriptions", { SubscriptionCount: nodes.length.toString() });
            return nodes;
        });
    }
    onSubscriptionChanged() {
        this.refresh();
    }
}
exports.StorageTreeDataProvider = StorageTreeDataProvider;
//# sourceMappingURL=storageTreeDataProvider.js.map