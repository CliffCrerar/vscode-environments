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
const path = require("path");
const vscode = require("vscode");
const fs = require("fs");
const deployments_1 = require("../utils/deployments");
const aliases_1 = require("../utils/aliases");
function deploy() {
    return __awaiter(this, void 0, void 0, function* () {
        const folder = yield vscode.window.showWorkspaceFolderPick({ ignoreFocusOut: true, placeHolder: 'Which folder to deploy ?' });
        if (folder) {
            const pathToDeploy = folder.uri.path;
            try {
                const files = fs.readdirSync(pathToDeploy);
                let deployType;
                const hasDockerfile = !!~files.indexOf('Dockerfile');
                const hasPackageJson = !!~files.indexOf('package.json');
                if (hasDockerfile && hasPackageJson) {
                    deployType = (yield vscode.window.showQuickPick([deployments_1.DeploymentTypeType.NPM, deployments_1.DeploymentTypeType.DOCKER], { placeHolder: 'Choose a deployment type...' }));
                    if (!deployType) {
                        return vscode.window.showErrorMessage('You should determine wich deployment type.');
                    }
                }
                else if (hasDockerfile) {
                    deployType = deployments_1.DeploymentTypeType.DOCKER;
                }
                else if (hasPackageJson) {
                    deployType = deployments_1.DeploymentTypeType.NPM;
                }
                else {
                    deployType = deployments_1.DeploymentTypeType.STATIC;
                }
                const deploymentName = yield vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Deployment name', value: path.parse(pathToDeploy).name });
                if (deploymentName) {
                    return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Deploying on ▲ZEIT now...' }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        const url = yield deployments_1.createDeployment(progress, pathToDeploy, deploymentName, deployType);
                        vscode.window.showInformationMessage('Successfully deployed !', `https://${url}`)
                            .then(clickedLink => {
                            if (clickedLink) {
                                vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(clickedLink));
                            }
                        });
                    }));
                }
                else {
                    vscode.window.showErrorMessage('You should provide a deployment name.');
                }
            }
            catch (error) {
                vscode.window.showErrorMessage('Deployment error: ' + error.message);
            }
        }
    });
}
exports.deploy = deploy;
function deleteDeployment(deploymentNode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (deploymentNode) {
            try {
                yield deployments_1.deleteDeployment(deploymentNode.data.uid);
                vscode.window.showInformationMessage('Deployment successfuly deleted');
            }
            catch (error) {
                vscode.window.showErrorMessage('Delete deployment error: ' + error.message);
            }
        }
        else {
            vscode.window.showInformationMessage('Right-click on a deployment in the explorer to delete it');
        }
    });
}
exports.deleteDeployment = deleteDeployment;
function open(deploymentNode) {
    if (deploymentNode) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://' + deploymentNode.data.url));
    }
    else {
        vscode.window.showInformationMessage('Right-click on a deployment in the explorer to open the application');
    }
}
exports.open = open;
function showLogs(deploymentNode) {
    if (deploymentNode) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://${deploymentNode.data.url}/_logs`));
    }
    else {
        vscode.window.showInformationMessage('Right-click on a deployment in the explorer to access logs');
    }
}
exports.showLogs = showLogs;
function setCustomAlias(deploymentNode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (deploymentNode) {
            const deploymentAlias = yield vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Alias (my-alias.now.sh or my-domain.tld)' });
            if (deploymentAlias) {
                try {
                    yield deployments_1.setAlias(deploymentNode.data, deploymentAlias);
                    vscode.window.showInformationMessage(`Alias ${deploymentAlias}.now.sh successfuly set to the deployment ${deploymentNode.data.url}.`);
                }
                catch (error) {
                    vscode.window.showErrorMessage('Set custom alias error: ' + error.message);
                }
            }
        }
        else {
            vscode.window.showInformationMessage('Right-click on a deployment in the explorer to set an alias');
        }
    });
}
exports.setCustomAlias = setCustomAlias;
function setExistingAlias(deploymentNode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (deploymentNode) {
            const selectedAlias = yield vscode.window.showQuickPick(aliases_1.getAliasNames(), { placeHolder: 'Choose an existing alias...' });
            if (selectedAlias) {
                try {
                    yield deployments_1.setAlias(deploymentNode.data, selectedAlias.label);
                    vscode.window.showInformationMessage(`Alias ${selectedAlias.label} successfuly set to the deployment ${deploymentNode.data.url}.`);
                }
                catch (error) {
                    vscode.window.showErrorMessage('Set existing alias error: ' + error.message);
                }
            }
        }
        else {
            vscode.window.showInformationMessage('Right-click on a deployment in the explorer to set an alias');
        }
    });
}
exports.setExistingAlias = setExistingAlias;
//# sourceMappingURL=deployments.js.map