'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const vscode_1 = require("vscode");
const fileManager_1 = require("./fileManager");
const path = require("path");
const packageJsonManager_1 = require("./packageJsonManager");
const child_process = require("child_process");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    try {
        let sub1 = vscode.commands.registerTextEditorCommand('gotoNodeModules.navigateToPackage', (textEditor, edit) => __awaiter(this, void 0, void 0, function* () {
            let packageFolder = checkAndGetPackageFolderUnderCursor(textEditor);
            if (packageFolder) {
                if (!fileManager_1.default.exists(packageFolder)) {
                    return failwith(ErrorCode.FOLDER_DOESNT_EXIST, packageFolder);
                }
                let packageJsonInPackageFolder = path.join(packageFolder, 'package.json');
                vscode_1.window
                    .showTextDocument(vscode_1.Uri.file(packageJsonInPackageFolder), {
                    preview: false
                })
                    .then(ok => {
                    vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
                });
            }
        }));
        let sub2 = vscode.commands.registerTextEditorCommand('gotoNodeModules.openPackageFolderInExplorer', (textEditor, edit) => __awaiter(this, void 0, void 0, function* () {
            let packageFolder = checkAndGetPackageFolderUnderCursor(textEditor);
            if (packageFolder) {
                if (!fileManager_1.default.exists(packageFolder)) {
                    return failwith(ErrorCode.FOLDER_DOESNT_EXIST, packageFolder);
                }
                child_process.exec(`start "" "${packageFolder}"`);
            }
        }));
        context.subscriptions.push(sub1, sub2);
    }
    catch (e) { }
}
exports.activate = activate;
function checkAndGetPackageFolderUnderCursor(textEditor) {
    if (!fileManager_1.default.isPackageJson(textEditor.document)) {
        return failwith(ErrorCode.NOT_PACKAGE_JSON);
    }
    if (!packageJsonManager_1.default.hasDependenciesDefined(textEditor)) {
        return failwith(ErrorCode.NO_PACKAGE_UNDER_CURSOR);
    }
    let packageFolder = packageJsonManager_1.default.extractPackageNameFromCurrentLine(textEditor);
    if (packageFolder === null) {
        return failwith(ErrorCode.NO_PACKAGE_UNDER_CURSOR);
    }
    return packageFolder;
}
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["NOT_PACKAGE_JSON"] = 0] = "NOT_PACKAGE_JSON";
    ErrorCode[ErrorCode["NO_PACKAGE_UNDER_CURSOR"] = 1] = "NO_PACKAGE_UNDER_CURSOR";
    ErrorCode[ErrorCode["FOLDER_DOESNT_EXIST"] = 2] = "FOLDER_DOESNT_EXIST";
})(ErrorCode || (ErrorCode = {}));
function failwith(error, ...args) {
    let msg = 'Unknown error :(';
    switch (error) {
        case ErrorCode.NOT_PACKAGE_JSON:
            msg = 'This command should only be called from an opened package.json !';
            break;
        case ErrorCode.NO_PACKAGE_UNDER_CURSOR:
            msg =
                'This command should be invoked on a line with a dependency definition';
            break;
        case ErrorCode.FOLDER_DOESNT_EXIST:
            if (args) {
                msg = `The folder ${args[0]} doesn't exists, did you install your dependencies ?`;
            }
            else {
                msg = `The requested package's folder doesn't exist, did you install your dependencies ?`;
            }
    }
    vscode_1.window.showErrorMessage(msg, 'Dismiss');
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map