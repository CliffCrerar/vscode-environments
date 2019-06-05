"use strict";
const vscode = require('vscode');
const prettydiff = require('prettydiff');
function format(document, range, options) {
    if (range === null) {
        let start = new vscode.Position(0, 0);
        let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
        range = new vscode.Range(start, end);
    }
    let result = [];
    let content = document.getText(range);
    let args = {
        source: content,
        mode: "beautify"
    };
    switch (document.languageId) {
        case "css":
            args["lang"] = "css";
            break;
        case "less":
            args["lang"] = "css";
            break;
        case "scss":
            args["lang"] = "css";
            break;
        case "sass":
            args["lang"] = "css";
            break;
        default:
            break;
    }
    let settings = vscode.workspace.getConfiguration("sfmt");
    for (let attrname in settings) {
        args[attrname] = settings[attrname];
    }
    let output = prettydiff.api(args);
    result.push(new vscode.TextEdit(range, output[0]));
    return result;
}
exports.format = format;
function activate(context) {
    let docType = ["css", "less", "scss", "sass"];
    docType.forEach(element => {
        registerDocType(element);
    });
    function registerDocType(type) {
        context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(type, {
            provideDocumentFormattingEdits: (document, options, token) => {
                return format(document, null, options);
            }
        }));
        context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider(type, {
            provideDocumentRangeFormattingEdits: (document, range, options, token) => {
                let start = new vscode.Position(0, 0);
                let end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
                return format(document, new vscode.Range(start, end), options);
            }
        }));
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map