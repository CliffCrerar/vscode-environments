'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const DocumentElement_1 = require("./DocumentElement");
const ConstructorElement_1 = require("./ConstructorElement");
class TypeElement extends DocumentElement_1.default {
    get constructors() {
        if (!this._constructors)
            this._constructors = ConstructorElement_1.default.fromCSType(this);
        return this._constructors;
    }
    ;
    get text() {
        return this.document.getText(this.range);
    }
    ;
    static fromCursorPosition(document, cursorPosition) {
        var typeDefinition = new TypeElement(document);
        var succes = typeDefinition.resolve(cursorPosition);
        if (!succes)
            return null;
        return typeDefinition;
    }
    resolve(position) {
        let pattern = new RegExp(/ (?:class|struct)\s+(\w+)/g);
        for (let line = position.line; line >= 0; line--) {
            let textLine = this.document.lineAt(line);
            let declarationMatch = pattern.exec(textLine.text);
            if (declarationMatch) {
                var typePosition = new vscode.Position(line, 0);
                var typeRange = this.tryFindCodeBlockRange(typePosition);
                if (typeRange != null && typeRange.contains(position)) {
                    this.range = typeRange;
                    this.name = declarationMatch[1];
                    return true;
                }
            }
        }
        return false;
    }
    static tryGetSelectedTypeName(document, range) {
        let readonlyRegex = new RegExp(/(public|private|internal|protected)?\s(class|interface|enum|struct)\s(\w+)/g);
        let textLine = document.lineAt(range.start.line);
        let match = readonlyRegex.exec(textLine.text);
        if (match) {
            return match[3];
        }
        return null;
    }
    deleteFromDocument() {
        var edit = new vscode.WorkspaceEdit();
        edit.delete(this.document.uri, this.range);
        vscode.workspace.applyEdit(edit);
    }
}
exports.default = TypeElement;
//# sourceMappingURL=TypeElement.js.map