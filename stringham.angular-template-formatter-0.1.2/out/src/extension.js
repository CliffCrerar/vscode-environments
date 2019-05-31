'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const formatter_1 = require("./formatter");
const VALID_LANG = 'html';
function activate(context) {
    const editProvider = new formatter_1.EditProvider();
    console.log('angular template formatter: activated');
    context.subscriptions.push(vscode_1.languages.registerDocumentFormattingEditProvider(VALID_LANG, editProvider));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map