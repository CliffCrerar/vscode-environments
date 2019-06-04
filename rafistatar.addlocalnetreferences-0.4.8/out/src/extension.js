'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const FileOperations_1 = require("./FileOperations");
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.addLocalreference', () => {
        let _fileOperation = new FileOperations_1.FileOperations();
        _fileOperation.terminal = vscode.window.createTerminal('terminal references');
        vscode.window.showInputBox({ prompt: 'Input .Net reference (.dll) full path' }).then(val => {
            try {
                _fileOperation.init(val);
                _fileOperation.createNUSPECFile();
                _fileOperation.createContentType();
                _fileOperation.createRels();
                _fileOperation.createPSMDCP();
                _fileOperation.copyFileAndZipping().then(name => {
                    _fileOperation.creatNugetConfig();
                    _fileOperation.addPackage(name);
                });
            }
            catch (err) {
                if (err)
                    vscode.window.showErrorMessage(err);
            }
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map