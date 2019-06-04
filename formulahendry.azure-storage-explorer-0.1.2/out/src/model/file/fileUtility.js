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
const directoryNode_1 = require("./directoryNode");
const fileNode_1 = require("./fileNode");
const infoNode_1 = require("../infoNode");
class FileUtility {
    static listFilesAndDirectories(fileShare, fileService, fileShareOrDirectoryNode, directoryPath) {
        return new Promise((resolve, reject) => {
            fileService.listFilesAndDirectoriesSegmented(fileShare.name, directoryPath, null, (error, result, response) => {
                if (error) {
                    resolve([new infoNode_1.InfoNode(`Failed to list files and directories: ${error})`)]);
                }
                const fileNodes = result.entries.files.map((file) => {
                    return new fileNode_1.FileNode(file, directoryPath, fileShare, fileService, fileShareOrDirectoryNode);
                });
                const directoryNodes = result.entries.directories.map((directory) => {
                    return new directoryNode_1.DirectoryNode(directory, directoryPath, fileShare, fileService, fileShareOrDirectoryNode);
                });
                resolve([...fileNodes, ...directoryNodes]);
            });
        });
    }
    static uploadFile(storageTreeDataProvider, fileShare, fileService, fileShareOrDirectoryNode, directoryPath) {
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
            const fileName = path.basename(filePath);
            if (!fileName) {
                return;
            }
            vscode.window.withProgress({
                title: `Uploading ${filePath} to ${fileShare.name} ...`,
                location: vscode.ProgressLocation.Window,
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve, reject) => {
                    fileService.createFileFromLocalFile(fileShare.name, directoryPath, fileName, filePath, (error, result, response) => {
                        if (error) {
                            vscode.window.showErrorMessage(error.message);
                            reject(error.message);
                        }
                        else {
                            storageTreeDataProvider.refresh(fileShareOrDirectoryNode);
                            resolve();
                        }
                    });
                });
            }));
        });
    }
    static createDirectory(storageTreeDataProvider, fileShare, fileService, fileShareOrDirectoryNode, directoryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            vscode.window.showInputBox({
                prompt: "Enter directory name",
            }).then((directoryName) => __awaiter(this, void 0, void 0, function* () {
                if (!directoryName) {
                    return;
                }
                vscode.window.withProgress({
                    title: `Creating directory [${directoryName}] ...`,
                    location: vscode.ProgressLocation.Window,
                }, (progress) => __awaiter(this, void 0, void 0, function* () {
                    yield new Promise((resolve, reject) => {
                        fileService.createDirectoryIfNotExists(fileShare.name, path.join(directoryPath, directoryName), (error, result, response) => {
                            if (error) {
                                vscode.window.showErrorMessage(error.message);
                                reject(error.message);
                            }
                            else {
                                storageTreeDataProvider.refresh(fileShareOrDirectoryNode);
                                resolve();
                            }
                        });
                    });
                }));
            }));
        });
    }
}
exports.FileUtility = FileUtility;
//# sourceMappingURL=fileUtility.js.map