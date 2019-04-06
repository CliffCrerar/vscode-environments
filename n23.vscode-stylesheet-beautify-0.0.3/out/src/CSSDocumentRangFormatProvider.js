"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const FormaterProvider_1 = require("./FormaterProvider");
class CSSDocumentRangFormatProvider {
    constructor(format = new FormaterProvider_1.FormaterProvider()) {
        this.format = format;
    }
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        if (document.validateRange(range)) {
            let originText = document.getText(range);
            let formattedText = this.format.css(originText, options);
            let textEdits = [];
            let reformated = vscode_1.TextEdit.replace(range, formattedText);
            textEdits.push(reformated);
            return textEdits;
        }
        return null;
    }
}
exports.CSSDocumentRangFormatProvider = CSSDocumentRangFormatProvider;
//# sourceMappingURL=CSSDocumentRangFormatProvider.js.map