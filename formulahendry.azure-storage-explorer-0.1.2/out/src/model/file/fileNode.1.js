"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class FileNode {
    constructor(file, fileShare, fileService, fileShareNode) {
        this.file = file;
        this.fileShare = fileShare;
        this.fileService = fileService;
        this.fileShareNode = fileShareNode;
    }
    getTreeItem() {
        return {
            label: this.file.name,
            command: {
                command: "azure-storage-explorer.getBlob",
                title: "",
                arguments: [this],
            },
            contextValue: "file",
            iconPath: path.join(__filename, "..", "..", "..", "..", "..", "resources", "Document_16x.png"),
        };
    }
    getChildren(azureAccount) {
        return [];
    }
}
exports.FileNode = FileNode;
//# sourceMappingURL=fileNode.1.js.map