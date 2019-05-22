'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const DocumentElement_1 = require("./DocumentElement");
class ConstructorElement extends DocumentElement_1.default {
    constructor() {
        super(...arguments);
        this.pattern = () => "(public|private|protected|internal)?\\s*" + this.type.name + "\\s*?\\(([\\w\\s,]+)?\\)";
    }
    get declarationPattern() { return new RegExp(this.pattern(), "g"); }
    get declarationPatternWithOpeningBracee() { return new RegExp(this.pattern() + "[\\s\\S]*?{", "g"); }
    get nextParameterPosition() {
        var constructorText = this.document.getText(this.range);
        var match = this.declarationPattern.exec(constructorText);
        var lastBracketPosition = match.index + match[0].length - 1;
        return this.convertIndexInRangeToPosition(lastBracketPosition, this.range);
    }
    ;
    get firstLinePosition() {
        var constructorText = this.document.getText(this.range);
        var match = this.declarationPatternWithOpeningBracee.exec(constructorText);
        var lastBracketPosition = match.index + match[0].length;
        var position = this.convertIndexInRangeToPosition(lastBracketPosition, this.range);
        return new vscode.Position(position.line, position.character);
    }
    ;
    get hasParameters() {
        var constructorText = this.document.getText(this.range);
        var match = this.declarationPatternWithOpeningBracee.exec(constructorText);
        return match[2] != null;
    }
    static fromCSType(type) {
        var constructor = new ConstructorElement(type.document);
        constructor.type = type;
        var success = constructor.resolve(type);
        if (!success)
            return null;
        return constructor;
    }
    resolve(type) {
        var typeText = this.document.getText(type.range);
        var match = this.declarationPattern.exec(typeText);
        var constructorPosition = this.convertIndexInRangeToPosition(match.index, type.range);
        var constructorRange = this.tryFindCodeBlockRange(constructorPosition);
        if (!constructorRange)
            return false;
        this.range = constructorRange;
        return true;
    }
    addInjectedParameter(parameterType) {
        var parameterNameBase = parameterType;
        if (parameterType.startsWith("I") && parameterType.charAt(1).toLocaleUpperCase() == parameterType.charAt(1)) {
            parameterNameBase = parameterType.slice(1);
        }
        var seperator = "";
        if (this.hasParameters) {
            seperator = ", ";
        }
        var parameterName = parameterNameBase.charAt(0).toLowerCase() + parameterNameBase.slice(1);
        var parameterDeclaration = seperator + parameterType + " " + parameterName;
        var fieldDeclaration = "private readonly " + parameterType + " _" + parameterName + ";\n\n";
        var fieldAssignment = "\n_" + parameterName + " = " + parameterName + ";";
        var edit = new vscode.WorkspaceEdit();
        edit.insert(this.document.uri, this.range.start, fieldDeclaration);
        edit.insert(this.document.uri, this.firstLinePosition, fieldAssignment);
        edit.insert(this.document.uri, this.nextParameterPosition, parameterDeclaration);
        var formatStart = new vscode.Position(this.range.start.line - 2, 0);
        var formatEnd = new vscode.Position(this.firstLinePosition.line + 3, 0);
        vscode.workspace.applyEdit(edit).then(success => {
            this.resolve(this.type);
            vscode.commands.executeCommand('vscode.executeFormatRangeProvider', this.document.uri, new vscode.Range(formatStart, formatEnd)).then((result) => {
                var edit = new vscode.WorkspaceEdit();
                edit.set(this.document.uri, result);
                vscode.workspace.applyEdit(edit);
            });
        });
    }
}
exports.default = ConstructorElement;
//# sourceMappingURL=ConstructorElement.js.map