'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("../utils");
class DocumentElement {
    constructor(document) {
        this.document = document;
    }
    tryFindCodeBlockRange(position) {
        var counter = new utils_1.utils.BalancedCounter();
        let line;
        for (line = position.line; line <= this.document.lineCount; line++) {
            var lineText = this.document.lineAt(line).text;
            counter.up(utils_1.utils.Regex.countOccurances("{", lineText));
            counter.down(utils_1.utils.Regex.countOccurances("}", lineText));
            if (counter.isBalanced())
                break;
            if (counter.balance < 0)
                break;
        }
        if (!counter.isBalanced())
            return null;
        var end = new vscode.Position(line, this.document.lineAt(line).text.length);
        return new vscode.Range(position, end);
    }
    convertIndexInRangeToPosition(index, range) {
        var rangeStartIndex = this.document.offsetAt(range.start);
        return this.document.positionAt(rangeStartIndex + index);
    }
}
exports.default = DocumentElement;
//# sourceMappingURL=DocumentElement.js.map