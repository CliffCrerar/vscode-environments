'use strict';
import * as vscode from 'vscode';
import { TidyFormatter } from './tidyformatter';
const HTMLFilter = ["html", "handlebar", "razor"];
export function activate(context) {
    const formatter = new TidyFormatter();
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(formatter.readSettings, formatter));
    context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(formatter.formatAuto, formatter));
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(HTMLFilter, formatter));
    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(HTMLFilter, formatter));
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.tidyHtml', formatter.formatTextEditor, formatter));
    return formatter;
}
export function deactivate() {
}
//# sourceMappingURL=extension.js.map