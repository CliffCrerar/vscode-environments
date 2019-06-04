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
const copypaste = require("copy-paste");
const path = require("path");
const vscode = require("vscode");
const utility_1 = require("../common/utility");
class BlobNode {
    constructor(blob, container, blobService, blobContainerNode) {
        this.blob = blob;
        this.container = container;
        this.blobService = blobService;
        this.blobContainerNode = blobContainerNode;
    }
    getTreeItem() {
        return {
            label: this.blob.name,
            command: {
                command: "azure-storage-explorer.getBlob",
                title: "",
                arguments: [this],
            },
            contextValue: "blob",
            iconPath: path.join(__filename, "..", "..", "..", "..", "resources", "Document_16x.png"),
        };
    }
    getChildren(azureAccount) {
        return [];
    }
    getBlob() {
        utility_1.Utility.appendLine(JSON.stringify(this.blob, null, 2));
    }
    downloadBlob() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                defaultUri: vscode.Uri.file(this.blob.name),
            };
            const filePathUri = yield vscode.window.showSaveDialog(options);
            if (!filePathUri) {
                return;
            }
            const filePath = filePathUri.fsPath;
            vscode.window.withProgress({
                title: `Downloading blob to ${filePath} ...`,
                location: vscode.ProgressLocation.Window,
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve, reject) => {
                    this.blobService.getBlobToLocalFile(this.container.name, this.blob.name, filePath, (error, result, response) => {
                        if (error) {
                            reject(error.message);
                        }
                        else {
                            // vscode.window.showInformationMessage(`Blob [${this.blob.name}] is downloaded.`);
                            resolve();
                        }
                    });
                });
            }));
        });
    }
    copyBlobUrl() {
        const url = this.blobService.getUrl(this.container.name, this.blob.name);
        copypaste.copy(url, () => {
            vscode.window.showInformationMessage(`'${url}' is copied to clipboard.`);
        });
    }
    deleteBlob(storageTreeDataProvider) {
        const yes = "Yes";
        const no = "No";
        vscode.window.showInformationMessage(`Are you sure to delete ${this.blob.name}?`, { title: yes }, { title: no, isCloseAffordance: true }).then((selection) => {
            switch (selection && selection.title) {
                case yes:
                    vscode.window.withProgress({
                        title: `Deleting blob [${this.blob.name}] ...`,
                        location: vscode.ProgressLocation.Window,
                    }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        yield new Promise((resolve, reject) => {
                            this.blobService.deleteBlob(this.container.name, this.blob.name, (error, response) => {
                                if (error) {
                                    reject(error.message);
                                }
                                else {
                                    // vscode.window.showInformationMessage(`Blob [${this.blob.name}] is deleted.`);
                                    storageTreeDataProvider.refresh(this.blobContainerNode);
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
exports.BlobNode = BlobNode;
//# sourceMappingURL=blobNode.js.map