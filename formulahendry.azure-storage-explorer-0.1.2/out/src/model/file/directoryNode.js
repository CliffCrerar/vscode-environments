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
class DirectoryNode {
    constructor(directory, directoryPath, fileShare, fileService, fileShareOrDirectoryNode) {
        this.directory = directory;
        this.directoryPath = directoryPath;
        this.fileShare = fileShare;
        this.fileService = fileService;
        this.fileShareOrDirectoryNode = fileShareOrDirectoryNode;
    }
    getTreeItem() {
        return {
            label: this.directory.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "directory",
            iconPath: path.join(__filename, "..", "..", "..", "..", "..", "resources", "Folder_16x.png"),
        };
    }
    getChildren(azureAccount) {
        return fileUtility_1.FileUtility.listFilesAndDirectories(this.fileShare, this.fileService, this, path.join(this.directoryPath, this.directory.name));
    }
    uploadFile(storageTreeDataProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            fileUtility_1.FileUtility.uploadFile(storageTreeDataProvider, this.fileShare, this.fileService, this, path.join(this.directoryPath, this.directory.name));
        });
    }
    createDirectory(storageTreeDataProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            fileUtility_1.FileUtility.createDirectory(storageTreeDataProvider, this.fileShare, this.fileService, this, path.join(this.directoryPath, this.directory.name));
        });
    }
    deleteDirectory(storageTreeDataProvider) {
        const yes = "Yes";
        const no = "No";
        vscode.window.showInformationMessage(`Are you sure to delete ${this.directory.name}?`, { title: yes }, { title: no, isCloseAffordance: true }).then((selection) => {
            switch (selection && selection.title) {
                case yes:
                    vscode.window.withProgress({
                        title: `Deleting directory [${this.directory.name}] ...`,
                        location: vscode.ProgressLocation.Window,
                    }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        yield new Promise((resolve, reject) => {
                            this.fileService.deleteDirectoryIfExists(this.fileShare.name, path.join(this.directoryPath, this.directory.name), (error, response) => {
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
exports.DirectoryNode = DirectoryNode;
//# sourceMappingURL=directoryNode.js.map