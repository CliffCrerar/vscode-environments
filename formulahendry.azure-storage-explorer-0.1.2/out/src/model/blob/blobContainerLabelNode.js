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
const azureStorage = require("azure-storage");
const path = require("path");
const vscode = require("vscode");
const infoNode_1 = require("../infoNode");
const blobContainerNode_1 = require("./blobContainerNode");
class BlobContainerLabelNode {
    constructor(storageAccount, storageAccountKeys) {
        this.storageAccount = storageAccount;
        this.storageAccountKeys = storageAccountKeys;
    }
    getTreeItem() {
        return {
            label: "[Blob Containers]",
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "blobContainerLabel",
            iconPath: path.join(__filename, "..", "..", "..", "..", "..", "resources", "AzureBlob_16x.png"),
        };
    }
    getChildren() {
        const blobService = azureStorage.createBlobService(this.storageAccount.name, this.storageAccountKeys[0].value);
        return new Promise((resolve, reject) => {
            blobService.listContainersSegmented(null, (error, result, response) => {
                if (error) {
                    resolve([new infoNode_1.InfoNode(`Failed to list containers: ${error})`)]);
                }
                const containerNodes = result.entries.map((container) => {
                    return new blobContainerNode_1.BlobContainerNode(container, blobService, this);
                });
                resolve(containerNodes);
            });
        });
    }
    createContainer(storageTreeDataProvider) {
        const blobService = azureStorage.createBlobService(this.storageAccount.name, this.storageAccountKeys[0].value);
        vscode.window.showInputBox({
            prompt: "Enter container name",
        }).then((containerName) => __awaiter(this, void 0, void 0, function* () {
            if (!containerName) {
                return;
            }
            vscode.window.withProgress({
                title: `Creating container [${containerName}] ...`,
                location: vscode.ProgressLocation.Window,
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve, reject) => {
                    blobService.createContainerIfNotExists(containerName, (error, result, response) => {
                        if (error) {
                            vscode.window.showErrorMessage(error.message);
                            reject(error.message);
                        }
                        else {
                            // vscode.window.showInformationMessage(`Container [${containerName}] is created.`);
                            storageTreeDataProvider.refresh(this);
                            resolve();
                        }
                    });
                });
            }));
        }));
    }
}
exports.BlobContainerLabelNode = BlobContainerLabelNode;
//# sourceMappingURL=blobContainerLabelNode.js.map