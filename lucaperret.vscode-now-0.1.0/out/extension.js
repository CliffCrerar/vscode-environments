'use strict';
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
const authentication_1 = require("./commands/authentication");
const deployments_1 = require("./commands/deployments");
const aliases_1 = require("./commands/aliases");
const nowExplorer_1 = require("./explorer/nowExplorer");
const nowExplorer = new nowExplorer_1.NowExplorerProvider();
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.authentication.setToken', () => __awaiter(this, void 0, void 0, function* () {
        yield authentication_1.setToken();
        nowExplorer.refresh();
    })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.authentication.login', () => __awaiter(this, void 0, void 0, function* () {
        yield authentication_1.login();
        nowExplorer.refresh();
    })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.authentication.logout', () => __awaiter(this, void 0, void 0, function* () {
        yield authentication_1.logout();
        nowExplorer.refresh();
    })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.showLogs', deployments_1.showLogs));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.open', deployments_1.open));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.setCustomAlias', deployments_1.setCustomAlias));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.setExistingAlias', deployments_1.setExistingAlias));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.deploy', deployments_1.deploy));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deployment.delete', (deploymentNode) => __awaiter(this, void 0, void 0, function* () {
        yield deployments_1.deleteDeployment(deploymentNode);
        nowExplorer.refresh();
    })));
    context.subscriptions.push(vscode.commands.registerCommand('extension.alias.open', aliases_1.open));
    context.subscriptions.push(vscode.commands.registerCommand('extension.alias.delete', (aliasNode) => __awaiter(this, void 0, void 0, function* () {
        yield aliases_1.deleteAlias(aliasNode);
        nowExplorer.refresh();
    })));
    vscode.window.registerTreeDataProvider('nowExplorer', nowExplorer);
    context.subscriptions.push(vscode.commands.registerCommand('extension.explorer.refresh', () => nowExplorer.refresh()));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map