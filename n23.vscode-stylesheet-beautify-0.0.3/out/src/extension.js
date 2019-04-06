'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const CSSDocumentFormatPovider_1 = require("./CSSDocumentFormatPovider");
const CSSDocumentRangFormatProvider_1 = require("./CSSDocumentRangFormatProvider");
function activate(context) {
    let sel = ['css', 'sass', 'scss', 'less'];
    console.log('Actived vscode-stylesheet-beautify!');
    let disposable = vscode_1.commands.registerCommand('extension.formater', () => {
        vscode_1.window.showInformationMessage('Actived vscode-stylesheet-beautify!');
    });
    context.subscriptions.push(disposable);
    let disposableFormatDoc = vscode_1.languages.registerDocumentFormattingEditProvider(sel, new CSSDocumentFormatPovider_1.CSSDocumentFormatPovider());
    let disposableFormatRang = vscode_1.languages.registerDocumentRangeFormattingEditProvider(sel, new CSSDocumentRangFormatProvider_1.CSSDocumentRangFormatProvider());
    context.subscriptions.push(disposableFormatDoc);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    console.log('Deactived vscode-stylesheet-beautify!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map