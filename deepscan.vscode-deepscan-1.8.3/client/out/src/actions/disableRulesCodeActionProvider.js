/* --------------------------------------------------------------------------------------------
 * Copyright (c) S-Core Co., Ltd. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const deepscanCodeActionProvider_1 = require("./deepscanCodeActionProvider");
class disableRulesCodeActionProvider extends deepscanCodeActionProvider_1.default {
    constructor(context) {
        super('ignore-line');
        this.comment = 'deepscan-disable-line';
        this.command = vscode.commands.registerCommand(this.getCommandId(), this.execute, this);
        context.subscriptions.push(this.command);
        this.provider = new TextDocumentContentProvider(context);
        vscode.workspace.registerTextDocumentContentProvider(this.getScheme(), this.provider);
    }
    codeActions(document, range, diagnostics, token) {
        let commands = [];
        if (diagnostics.length > 0) {
            let ruleKeys = diagnostics.map(diagnostic => diagnostic.code);
            commands.push({
                arguments: [document],
                command: this.getCommandId(),
                title: `Ignore this line`,
            });
            commands.push({
                arguments: [document, ruleKeys],
                command: this.getCommandId(),
                title: `Ignore this rule ${ruleKeys}`,
            });
        }
        return commands;
    }
    execute(document, ruleKeys) {
        let editor = vscode.window.activeTextEditor;
        let textLine = editor.document.lineAt(editor.selection.active.line);
        let edit = new vscode.WorkspaceEdit();
        if (ruleKeys) {
            edit.insert(document.uri, textLine.range.end, ` // ${this.comment} ${ruleKeys.join(',')}`);
        }
        else {
            edit.insert(document.uri, textLine.range.end, ` // ${this.comment}`);
        }
        return vscode.workspace.applyEdit(edit);
    }
    dispose() {
        this.command.dispose();
    }
}
exports.default = disableRulesCodeActionProvider;
class TextDocumentContentProvider {
    constructor(context) {
        this._onDidChange = new vscode.EventEmitter();
        this.context = context;
    }
    provideTextDocumentContent(uri) {
        return 'TODO';
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
}
//# sourceMappingURL=disableRulesCodeActionProvider.js.map