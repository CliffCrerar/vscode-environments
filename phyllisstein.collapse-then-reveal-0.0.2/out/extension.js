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
const vscode_1 = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode_1.window.onDidChangeVisibleTextEditors(collapseThenReveal));
}
exports.activate = activate;
function collapseThenReveal(editors) {
    return __awaiter(this, void 0, void 0, function* () {
        if (editors && editors.length) {
            yield vscode_1.commands.executeCommand('workbench.files.action.collapseExplorerFolders');
            yield vscode_1.commands.executeCommand('revealInExplorer');
            vscode_1.window.showTextDocument(editors[0].document);
        }
    });
}
//# sourceMappingURL=extension.js.map