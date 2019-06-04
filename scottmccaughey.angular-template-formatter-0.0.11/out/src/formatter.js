"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prettyprint_1 = require("./prettyprint");
const vscode_1 = require("vscode");
class EditProvider {
    provideDocumentFormattingEdits(document, options, token) {
        let useSpaces = vscode_1.workspace
            .getConfiguration('angular-template-formatter')
            .get('useSpaces', true);
        let indentation = vscode_1.workspace
            .getConfiguration('angular-template-formatter')
            .get('indentWidth', 2);
        let closeTagSameLine = vscode_1.workspace
            .getConfiguration('angular-template-formatter')
            .get('closeTagSameLine', true);
        let skipContents = vscode_1.workspace
            .getConfiguration('angular-template-formatter')
            .get('skipContents', [
            'p',
            'li',
            'span',
            'em',
            'strong',
            'i',
            'b',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6'
        ]);
        try {
            if (document.fileName.endsWith('.scala.html')) {
                return [];
            }
            let text = document.getText();
            return [
                vscode_1.TextEdit.replace(new vscode_1.Range(document.positionAt(0), document.positionAt(text.length)), prettyprint_1.format(text, indentation, useSpaces, closeTagSameLine, skipContents))
            ];
        }
        catch (e) {
            vscode_1.window.showErrorMessage(e.message);
        }
    }
}
exports.EditProvider = EditProvider;
//# sourceMappingURL=formatter.js.map