'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
require("./init");
const vscode = require("vscode");
class DiffTextContentProvider {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
        this.scheme = 'gitdiff:';
    }
    provideTextDocumentContent(uri) {
        return decodeURIComponent(uri.toString()).slice(this.scheme.length, -18);
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
}
exports.DiffTextContentProvider = DiffTextContentProvider;
//# sourceMappingURL=DiffTextContentProvider.1.js.map