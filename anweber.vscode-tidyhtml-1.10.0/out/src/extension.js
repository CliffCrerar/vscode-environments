'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tidyformatter_1 = require("./tidyformatter");
const HTMLFilter = ['html', 'handlebar', 'razor'];
function activate(context) {
    const formatter = new tidyformatter_1.TidyFormatter();
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(formatter.readSettings, formatter));
    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(formatter.formatAuto, formatter));
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(HTMLFilter, formatter));
    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(HTMLFilter, formatter));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.tidyHtml', formatter.formatTextEditor, formatter));
    return formatter;
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map