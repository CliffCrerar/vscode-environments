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
const path = require("path");
const moment = require("moment");
const deployments_1 = require("../utils/deployments");
const aliases_1 = require("../utils/aliases");
class NodeBase {
    constructor(label) {
        this.label = label;
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
}
exports.NodeBase = NodeBase;
class AliasNode extends NodeBase {
    constructor(data, eventEmitter) {
        super(data.alias);
        this.data = data;
        this.eventEmitter = eventEmitter;
    }
    getTreeItem() {
        return {
            label: `${this.label} (${moment(new Date(this.data.created)).fromNow()})`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'aliasNode',
            tooltip: 'Deployment: ' + (this.data.deployment ? this.data.deployment.url : this.data.deploymentId)
        };
    }
}
exports.AliasNode = AliasNode;
class DeploymentNode extends NodeBase {
    constructor(data, eventEmitter) {
        super(data.url);
        this.data = data;
        this.eventEmitter = eventEmitter;
    }
    getTreeItem() {
        let icon;
        if (this.data.state === deployments_1.StateType.READY) {
            icon = 'runningDeployment';
        }
        else if (~[deployments_1.StateType.BOOTED, deployments_1.StateType.BUILDING, deployments_1.StateType.DEPLOYING].indexOf(this.data.state)) {
            icon = 'deployment';
        }
        else {
            icon = 'errorDeployment';
        }
        return {
            label: `${this.label} (${moment(new Date(Number(this.data.created))).fromNow()})`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'deploymentNode',
            iconPath: {
                light: path.join(__filename, '..', '..', '..', 'resources', 'light', icon + '.svg'),
                dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', icon + '.svg')
            },
            tooltip: this.data.state
        };
    }
}
exports.DeploymentNode = DeploymentNode;
class DeploymentNameNode extends NodeBase {
    constructor(label, deployments, eventEmitter) {
        super(label);
        this.label = label;
        this.deployments = deployments;
        this.eventEmitter = eventEmitter;
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'applicationNode'
        };
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.deployments.map(deployment => new DeploymentNode(deployment, this.eventEmitter));
        });
    }
}
exports.DeploymentNameNode = DeploymentNameNode;
class RootNode extends NodeBase {
    constructor(label, contextValue, eventEmitter) {
        super(label);
        this.label = label;
        this.contextValue = contextValue;
        this.eventEmitter = eventEmitter;
    }
    getTreeItem() {
        return {
            label: this.label,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: this.contextValue
        };
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (element.contextValue === 'deploymentsRootNode') {
                return this.getDeployments();
            }
            else if (element.contextValue === 'aliasesRootNode') {
                return this.getAliases();
            }
            return [];
        });
    }
    getDeployments() {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Loading deployments' }, (progress) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const deployments = yield deployments_1.getDeployments();
                    const applications = new Map();
                    for (const deployment of deployments) {
                        if (applications.has(deployment.name)) {
                            applications.get(deployment.name).push(deployment);
                        }
                        else {
                            applications.set(deployment.name, [deployment]);
                        }
                    }
                    return Array.from(applications).map(([name, deployments]) => new DeploymentNameNode(name, deployments, this.eventEmitter));
                }
                catch (error) {
                    vscode.window.showErrorMessage('Get deployments error: ' + error.message);
                    return [];
                }
            }));
        });
    }
    getAliases() {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Loading aliases' }, (progress) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const aliases = yield aliases_1.getAliases();
                    return aliases.map(alias => new AliasNode(alias, this.eventEmitter));
                }
                catch (error) {
                    vscode.window.showErrorMessage('Get aliases error: ' + error.message);
                    return [];
                }
            }));
        });
    }
}
exports.RootNode = RootNode;
//# sourceMappingURL=models.js.map