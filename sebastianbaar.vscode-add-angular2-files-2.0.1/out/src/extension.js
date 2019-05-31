"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const add_files_1 = require("./add-files");
const add_files_extended_1 = require("./add-files-extended");
function activate(context) {
    console.log('Congratulations, your extension is now active!');
    var addAngularFiles = vscode_1.commands.registerCommand('extension.addAngularFiles', (args) => {
        const addFiles = new add_files_1.AddFiles();
        addFiles.showFileNameDialog(args)
            .then(addFiles.createFolder)
            .then(addFiles.createFiles)
            .then(addFiles.openFileInEditor)
            .catch((err) => {
            if (err) {
                vscode_1.window.showErrorMessage(err);
            }
        });
    });
    var addAngularFilesExtended = vscode_1.commands.registerCommand('extension.addAngularFilesExtended', (args) => {
        const addFilesExtended = new add_files_extended_1.AddFilesExtended();
        addFilesExtended.showFileNameDialog(args)
            .then(addFilesExtended.createFolder)
            .then(addFilesExtended.createFiles)
            .then(addFilesExtended.openFileInEditor)
            .catch((err) => {
            if (err) {
                vscode_1.window.showErrorMessage(err);
            }
        });
    });
    context.subscriptions.push(addAngularFiles);
    context.subscriptions.push(addAngularFilesExtended);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map