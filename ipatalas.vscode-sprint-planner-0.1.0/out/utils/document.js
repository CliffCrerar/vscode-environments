"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vsc = require("vscode");
class Document {
    static getTextBeforeCursor(document, position) {
        const range = new vsc.Range(new vsc.Position(position.line, 0), position);
        return document.getText(range);
    }
}
exports.Document = Document;
//# sourceMappingURL=document.js.map