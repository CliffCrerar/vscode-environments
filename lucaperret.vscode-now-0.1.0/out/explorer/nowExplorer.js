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
const models_1 = require("./models");
const authentication_1 = require("../utils/authentication");
class NowExplorerProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._deploymentsNode = new models_1.RootNode('Deployments', 'deploymentsRootNode', this._onDidChangeTreeData);
        this._aliasesNode = new models_1.RootNode('Aliases', 'aliasesRootNode', this._onDidChangeTreeData);
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element.getTreeItem();
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!element) {
                return this.getRootNodes();
            }
            return element.getChildren(element);
        });
    }
    getRootNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const rootNodes = [];
            let token = yield authentication_1.getAuthenticationToken();
            if (!token) {
                return rootNodes;
            }
            rootNodes.push(this._deploymentsNode);
            rootNodes.push(this._aliasesNode);
            return rootNodes;
        });
    }
}
exports.NowExplorerProvider = NowExplorerProvider;
//# sourceMappingURL=nowExplorer.js.map