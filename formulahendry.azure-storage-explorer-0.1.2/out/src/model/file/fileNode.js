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
class FileNode {
    constructor(file, directoryPath, fileShare, fileService, fileShareOrDirectoryNode) {
        this.file = file;
        this.directoryPath = directoryPath;
        this.fileShare = fileShare;
        this.fileService = fileService;
        this.fileShareOrDirectoryNode = fileShareOrDirectoryNode;
    }
    getTreeItem() {
        return {
            label: this.file.name,
            contextValue: "file",
            iconPath: path.join(__filename, "..", "..", "..", "..", "..", "resources", "Document_16x.png"),
        };
    }
    getChildren(azureAccount) {
        return [];
    }
    downloadFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                defaultUri: vscode.Uri.file(this.file.name),
            };
            const filePathUri = yield vscode.window.showSaveDialog(options);
            if (!filePathUri) {
                return;
            }
            const filePath = filePathUri.fsPath;
            vscode.window.withProgress({
                title: `Downloading file to ${filePath} ...`,
                location: vscode.ProgressLocation.Window,
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve, reject) => {
                    this.fileService.getFileToLocalFile(this.fileShare.name, this.directoryPath, this.file.name, filePath, (error, result, response) => {
                        if (error) {
                            vscode.window.showErrorMessage(error.message);
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
    copyFileUrl() {
        const url = this.fileService.getUrl(this.fileShare.name, this.directoryPath, this.file.name);
        copypaste.copy(url, () => {
            vscode.window.showInformationMessage(`'${url}' is copied to clipboard.`);
        });
    }
    deleteFile(storageTreeDataProvider) {
        const yes = "Yes";
        const no = "No";
        vscode.window.showInformationMessage(`Are you sure to delete ${this.file.name}?`, { title: yes }, { title: no, isCloseAffordance: true }).then((selection) => {
            switch (selection && selection.title) {
                case yes:
                    vscode.window.withProgress({
                        title: `Deleting file [${this.file.name}] ...`,
                        location: vscode.ProgressLocation.Window,
                    }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        yield new Promise((resolve, reject) => {
                            this.fileService.deleteFileIfExists(this.fileShare.name, this.directoryPath, this.file.name, (error, response) => {
                                if (error) {
                                    vscode.window.showErrorMessage(error.message);
                                    reject(error.message);
                                }
                                else {
                                    storageTreeDataProvider.refresh(this.fileShareOrDirectoryNode);
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
exports.FileNode = FileNode;
//# sourceMappingURL=fileNode.js.map