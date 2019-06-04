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
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const blobNode_1 = require("./blobNode");
const infoNode_1 = require("./infoNode");
class BlobContainerNode {
    constructor(container, blobService, blobContainerLabelNode) {
        this.container = container;
        this.blobService = blobService;
        this.blobContainerLabelNode = blobContainerLabelNode;
    }
    getTreeItem() {
        return {
            label: this.container.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "blobContainer",
            iconPath: path.join(__filename, "..", "..", "..", "..", "resources", "AzureBlob_16x.png"),
        };
    }
    getChildren(azureAccount) {
        return new Promise((resolve, reject) => {
            this.blobService.listBlobsSegmented(this.container.name, null, (error, result, response) => {
                if (error) {
                    resolve([new infoNode_1.InfoNode(`Failed to list containers: ${error})`)]);
                }
                const blobNodes = result.entries.map((blob) => {
                    return new blobNode_1.BlobNode(blob, this.container, this.blobService, this);
                });
                resolve(blobNodes);
            });
        });
    }
    uploadBlob(storageTreeDataProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                openLabel: "Upload",
            };
            const filePathUri = yield vscode.window.showOpenDialog(options);
            if (!filePathUri) {
                return;
            }
            const filePath = filePathUri[0].fsPath;
            if (!fs.existsSync(filePath)) {
                vscode.window.showWarningMessage(`${filePath} does not exist.`);
                return;
            }
            vscode.window.showInputBox({
                prompt: "Enter blob name",
                value: path.basename(filePath),
            }).then((blobName) => __awaiter(this, void 0, void 0, function* () {
                if (!blobName) {
                    return;
                }
                vscode.window.withProgress({
                    title: `Uploading ${filePath} to ${this.container.name} ...`,
                    location: vscode.ProgressLocation.Window,
                }, (progress) => __awaiter(this, void 0, void 0, function* () {
                    yield new Promise((resolve, reject) => {
                        this.blobService.createBlockBlobFromLocalFile(this.container.name, blobName, filePath, (error, result, response) => {
                            if (error) {
                                reject(error.message);
                            }
                            else {
                                // vscode.window.showInformationMessage(`Blob [${blobName}] is uploaded.`);
                                storageTreeDataProvider.refresh(this);
                                resolve();
                            }
                        });
                    });
                }));
            }));
        });
    }
    deleteContainer(storageTreeDataProvider) {
        const yes = "Yes";
        const no = "No";
        vscode.window.showInformationMessage(`Are you sure to delete ${this.container.name}?`, { title: yes }, { title: no, isCloseAffordance: true }).then((selection) => {
            switch (selection && selection.title) {
                case yes:
                    vscode.window.withProgress({
                        title: `Deleting container [${this.container.name}] ...`,
                        location: vscode.ProgressLocation.Window,
                    }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        yield new Promise((resolve, reject) => {
                            this.blobService.deleteContainer(this.container.name, (error, response) => {
                                if (error) {
                                    reject(error.message);
                                }
                                else {
                                    // vscode.window.showInformationMessage(`Blob [${this.blob.name}] is deleted.`);
                                    storageTreeDataProvider.refresh(this.blobContainerLabelNode);
                                    resolve();
                                }
                            });
                        });
                    }));
                    break;
                default:
            }
        });
    }
}
exports.BlobContainerNode = BlobContainerNode;
//# sourceMappingURL=blobContainerNode.js.map