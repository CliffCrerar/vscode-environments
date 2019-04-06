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
const gitTagsResolver_1 = require("../services/gitTagsResolver");
function deleteCMD(provider, refreshTagsView) {
    return vscode.commands.registerCommand('extension.deleteGitTag', function (tag) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield gitTagsResolver_1.deleteTag(tag, vscode.workspace.rootPath);
                refreshTagsView();
                const picked = yield vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: 'Would you like to delete this tag from remote repository as well?'
                });
                if (picked !== 'Yes') {
                    return;
                }
                yield gitTagsResolver_1.syncDelete(tag, vscode.workspace.rootPath);
                vscode.window.setStatusBarMessage(`Remote tag ${tag} deleted`, 3000);
            }
            catch (err) {
                vscode.window.showErrorMessage('Delete remote Tag failed');
            }
        });
    });
}
exports.deleteCMD = deleteCMD;
//# sourceMappingURL=deleteTag.js.map