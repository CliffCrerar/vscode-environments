/* --------------------------------------------------------------------------------------------
 * Copyright (c) S-Core Co., Ltd. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const vscode_1 = require("vscode");
const types_1 = require("./types");
const decorationType = {
    isWholeLine: true,
    light: {
        after: {
            color: '#793600'
        }
    },
    dark: {
        after: {
            color: '#ff9527'
        }
    }
};
function activateDecorations(client) {
    let disposables = [];
    let deepscanDecorationType = vscode_1.window.createTextEditorDecorationType(decorationType);
    disposables.push(deepscanDecorationType);
    let showDecorators = vscode_1.workspace.getConfiguration('deepscan').get('showDecorators');
    let timeout = null;
    let activeEditor = vscode_1.window.activeTextEditor;
    vscode_1.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerReviveDecorations();
        }
    }, null, disposables);
    vscode_1.workspace.onDidChangeConfiguration(() => {
        showDecorators = vscode_1.workspace.getConfiguration('deepscan').get('showDecorators');
    });
    function triggerReviveDecorations() {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(reviveDecorations, 500);
    }
    function reviveDecorations() {
        if (!activeEditor) {
            return;
        }
        updateDecorationForEditor(activeEditor, client.diagnostics.get(activeEditor.document.uri));
    }
    function clearDecorations(uri) {
        vscode_1.window.visibleTextEditors.forEach((editor) => {
            if (editor.document && uri === editor.document.uri.toString()) {
                editor.setDecorations(deepscanDecorationType, []);
            }
        });
    }
    function updateDecorations(uri) {
        vscode_1.window.visibleTextEditors.forEach(editor => {
            if (editor.document && uri === editor.document.uri.toString()) {
                updateDecorationForEditor(editor, client.diagnostics.get(editor.document.uri));
            }
        });
    }
    function updateDecorationForEditor(editor, diagnostics) {
        if (!showDecorators) {
            clearDecorations(editor.document.uri.toString());
            return;
        }
        const suggestions = getSuggestions(diagnostics);
        // 1. Sort by severity as desc because the first decoration is taken when there are decorations on the same line.
        let result = _.sortBy(suggestions, ({ severity }) => severity);
        // 2. Display only 'DiagnosticSeverity.Error(1)' (Medium/High impact)
        result = _.filter(result, ({ severity }) => severity === types_1.DiagnosticSeverity.Error.valueOf());
        let decorations = result.map(({ startLine, startChar, endLine, endChar, message }) => ({
            range: new vscode_1.Range(startLine, 0, endLine, 1000),
            hoverMessage: message,
            renderOptions: {
                after: {
                    contentText: `  ← ${message}`
                }
            }
        }));
        editor.setDecorations(deepscanDecorationType, decorations);
    }
    function getSuggestions(diagnostics) {
        if (!diagnostics) {
            return [];
        }
        let suggestions = [];
        diagnostics.forEach(({ range, message, severity }) => {
            const suggestion = {
                startLine: range.start.line,
                startChar: range.start.character,
                endLine: range.end.line,
                endChar: range.end.character,
                message,
                severity
            };
            suggestions.push(suggestion);
        });
        return suggestions;
    }
    return {
        clearDecorations,
        updateDecorations,
        disposables: vscode_1.Disposable.from(...disposables)
    };
}
exports.activateDecorations = activateDecorations;
//# sourceMappingURL=deepscanDecorators.js.map