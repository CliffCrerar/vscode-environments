"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function getRange(document) {
    let start = new vscode_1.Position(0, 0);
    let endLine = document.lineCount - 1;
    let end = new vscode_1.Position(endLine, document.lineAt(endLine).text.length);
    return new vscode_1.Range(start, end);
}
exports.getRange = getRange;
//# sourceMappingURL=index.js.map