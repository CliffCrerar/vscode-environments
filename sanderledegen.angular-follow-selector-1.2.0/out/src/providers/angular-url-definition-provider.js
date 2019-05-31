"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const vscode_1 = require("vscode");
class AngularUrlDefinitionProvider {
    constructor() {
        this.urlRangeRegex = /[\w./-]+/;
    }
    provideDefinition(document, position) {
        const wordRange = document.getWordRangeAtPosition(position, this.urlRangeRegex);
        const clickedRelativeUri = document.getText(wordRange);
        const containingLine = document.lineAt(position.line).text;
        if (!containingLine.includes('templateUrl') && !containingLine.includes('styleUrls')) {
            return null;
        }
        const fullUri = path.resolve(path.dirname(document.fileName), clickedRelativeUri);
        return fs.existsSync(fullUri) ? new vscode_1.Location(vscode_1.Uri.file(fullUri), new vscode_1.Position(0, 0)) : null;
    }
}
exports.AngularUrlDefinitionProvider = AngularUrlDefinitionProvider;
//# sourceMappingURL=angular-url-definition-provider.js.map