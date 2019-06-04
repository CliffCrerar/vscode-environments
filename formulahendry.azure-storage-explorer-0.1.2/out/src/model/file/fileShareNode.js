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
const fileUtility_1 = require("./fileUtility");
class FileShareNode {
    constructor(fileShare, fileService, fileShareLabelNode) {
        this.fileShare = fileShare;
        this.fileService = fileService;
        this.fileShareLabelNode = fileShareLabelNode;
    }
    getTreeItem() {
        return {
            label: this.fileShare.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "fileShare",
            iconPath: path.join(__filename, "..", "..", "..", "..", "..", "resources", "AzureFileShare_16x.png"),
        };
    }
    getChildren(azureAccount) {
        return fileUtility_1.FileUtility.listFilesAndDirectories(this.fileShare, this.fileService, this, "");
    }
    uploadFile(storageTreeDataProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            fileUtility_1.FileUtility.uploadFile(storageTreeDataProvider, this.fileShare, this.fileService, this, "");
        });
    }
    createDirectory(storageTreeDataProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            fileUtility_1.FileUtility.createDirectory(storageTreeDataProvider, this.fileShare, this.fileService, this, "");
        });
    }
    deleteFileShare(storageTreeDataProvider) {
        const yes = "Yes";
        const no = "No";
        vscode.window.showInformationMessage(`Are you sure to delete ${this.fileShare.name}?`, { title: yes }, { title: no, isCloseAffordance: true }).then((selection) => {
            switch (selection && selection.title) {
                case yes:
                    vscode.window.withProgress({
                        title: `Deleting file share [${this.fileShare.name}] ...`,
                        location: vscode.ProgressLocation.Window,
                    }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        yield new Promise((resolve, reject) => {
                            this.fileService.deleteShareIfExists(this.fileShare.name, (error, response) => {
                                if (error) {
                                    vscode.window.showErrorMessage(error.message);
                                    reject(error.message);
                                }
                                else {
                                    storageTreeDataProvider.refresh(this.fileShareLabelNode);
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
exports.FileShareNode = FileShareNode;
//# sourceMappingURL=fileShareNode.js.map