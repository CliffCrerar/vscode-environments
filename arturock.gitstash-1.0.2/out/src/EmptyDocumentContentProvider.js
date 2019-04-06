'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class EmptyDocumentContentProvider {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    provideTextDocumentContent() {
        return '';
    }
}
exports.EmptyDocumentContentProvider = EmptyDocumentContentProvider;
//# sourceMappingURL=EmptyDocumentContentProvider.js.map