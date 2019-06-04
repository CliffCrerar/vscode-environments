"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const appInsightsClient_1 = require("./common/appInsightsClient");
const storageTreeDataProvider_1 = require("./storageTreeDataProvider");
function activate(context) {
    appInsightsClient_1.AppInsightsClient.sendEvent("loadExtension");
    const storageTreeDataProvider = new storageTreeDataProvider_1.StorageTreeDataProvider(context);
    context.subscriptions.push(vscode.window.registerTreeDataProvider("azureStorage", storageTreeDataProvider));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.selectSubscriptions", () => {
        appInsightsClient_1.AppInsightsClient.sendEvent("selectSubscriptions");
        vscode.commands.executeCommand("azure-account.selectSubscriptions");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.refresh", (node) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("refresh");
        storageTreeDataProvider.refresh(node);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.createContainer", (blobContainerLabel) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("createContainer");
        blobContainerLabel.createContainer(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.getBlob", (blobNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("getBlob");
        blobNode.getBlob();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.downloadBlob", (blobNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("downloadBlob");
        blobNode.downloadBlob();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.copyBlobUrl", (blobNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("copyBlobUrl");
        blobNode.copyBlobUrl();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.deleteBlob", (blobNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("deleteBlob");
        blobNode.deleteBlob(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.uploadBlob", (blobContainer) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("uploadBlob");
        blobContainer.uploadBlob(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.deleteContainer", (blobContainer) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("deleteContainer");
        blobContainer.deleteContainer(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.downloadFile", (fileNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("downloadFile");
        fileNode.downloadFile();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.copyFileUrl", (fileNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("copyFileUrl");
        fileNode.copyFileUrl();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.deleteFile", (fileNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("deleteFile");
        fileNode.deleteFile(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.deleteDirectory", (directoryNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("deleteDirectory");
        directoryNode.deleteDirectory(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.deleteFileShare", (fileShareNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("deleteFileShare");
        fileShareNode.deleteFileShare(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.uploadFile", (fileShareOrDirectoryNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("uploadFile");
        fileShareOrDirectoryNode.uploadFile(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.createDirectory", (fileShareOrDirectoryNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("createDirectory");
        fileShareOrDirectoryNode.createDirectory(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.createFileShare", (fileShareLabelNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("createFileShare");
        fileShareLabelNode.createFileShare(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.createTable", (tableLabelNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("createTable");
        tableLabelNode.createTable(storageTreeDataProvider);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("azure-storage-explorer.deleteTable", (tableNode) => {
        appInsightsClient_1.AppInsightsClient.sendEvent("deleteTable");
        tableNode.deleteTable(storageTreeDataProvider);
    }));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map