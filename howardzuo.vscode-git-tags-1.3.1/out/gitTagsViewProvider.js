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
const gitTagsResolver_1 = require("./services/gitTagsResolver");
const template_1 = require("./template");
exports.GITTAGSURI = vscode.Uri.parse('gittags://sourcecontrol/gittags');
class GitTagsViewProvider {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
        gitTagsResolver_1.refreshFromRemote(vscode.workspace.rootPath);
    }
    provideTextDocumentContent(uri) {
        if (!this._tags) {
            return '';
        }
        return template_1.html(this._tags);
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    updateTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const cwd = vscode.workspace.rootPath;
            this._tags = yield gitTagsResolver_1.tags(cwd);
            this._onDidChange.fire(exports.GITTAGSURI);
        });
    }
}
exports.GitTagsViewProvider = GitTagsViewProvider;
//# sourceMappingURL=gitTagsViewProvider.js.map