"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
const FormaterProvider_1 = require("./FormaterProvider");
class CSSDocumentFormatPovider {
    constructor(format = new FormaterProvider_1.FormaterProvider()) {
        this.format = format;
    }
    provideDocumentFormattingEdits(document, options, token) {
        let originText = document.getText();
        let formattedText = this.format.css(originText, options);
        var range = utils_1.getRange(document);
        let textEdits = [];
        let reformated = vscode_1.TextEdit.replace(range, formattedText);
        textEdits.push(reformated);
        return textEdits;
    }
}
exports.CSSDocumentFormatPovider = CSSDocumentFormatPovider;
//# sourceMappingURL=CSSDocumentFormatPovider.js.map