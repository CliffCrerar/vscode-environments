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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const gitTagsViewProvider_1 = require("./gitTagsViewProvider");
const commands_1 = require("./commands");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "git tags" is now active!');
    const provider = new gitTagsViewProvider_1.GitTagsViewProvider();
    const registration = vscode.workspace.registerTextDocumentContentProvider('gittags', provider);
    function refreshTagsView() {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscode.workspace.textDocuments.some(t => t.fileName === '/gittags')) {
                try {
                    yield provider.updateTags();
                }
                catch (err) {
                    vscode.window.showErrorMessage(err);
                }
            }
        });
    }
    context.subscriptions.push(commands_1.listCMD(provider, refreshTagsView));
    context.subscriptions.push(commands_1.createCMD(provider, refreshTagsView));
    context.subscriptions.push(commands_1.deleteCMD(provider, refreshTagsView));
    context.subscriptions.push(registration);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=index.js.map