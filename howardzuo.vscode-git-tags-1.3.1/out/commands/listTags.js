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
const vscode = require("vscode");
const gitTagsViewProvider_1 = require("../gitTagsViewProvider");
function listCMD(provider, refreshTagsView) {
    return vscode.commands.registerCommand('extension.gittags', function () {
        return __awaiter(this, void 0, void 0, function* () {
            // The code you place here will be executed every time your command is executed
            refreshTagsView();
            if (vscode.workspace.textDocuments.every(t => t.fileName !== '/gittags')) {
                try {
                    yield vscode.commands.executeCommand('vscode.previewHtml', gitTagsViewProvider_1.GITTAGSURI, vscode.ViewColumn.One, 'Git Tags');
                    yield provider.updateTags();
                }
                catch (err) {
                    vscode.window.showErrorMessage(err);
                }
            }
        });
    });
}
exports.listCMD = listCMD;
//# sourceMappingURL=listTags.js.map