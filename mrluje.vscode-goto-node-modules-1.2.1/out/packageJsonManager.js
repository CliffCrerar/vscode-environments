"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
class PackageJsonManager {
    checkIfPackageJson(document) {
        let { fileName } = document;
        return path.basename(fileName).toLowerCase() === 'package.json';
    }
    isPackageJson(document) {
        return document && this.checkIfPackageJson(document);
    }
    hasDependenciesDefined(textEditor) {
        let documentTillSelection = textEditor.document.getText(new vscode_1.Range(new vscode_1.Position(0, 0), new vscode_1.Position(textEditor.selection.anchor.line, 0)));
        // if there is no dependencies defined before, do not bother checking further
        return documentTillSelection.indexOf('ependencies') >= 0;
    }
    extractPackageNameFromCurrentLine(textEditor) {
        let lineText = textEditor.document.lineAt(textEditor.selection.anchor.line)
            .text;
        let matches = /\"(.*)\": +\"/.exec(lineText);
        if (matches === null || matches.length < 1) {
            return null;
        }
        let packageName = matches[1];
        let node_modules = path.join(path.dirname(textEditor.document.fileName), 'node_modules');
        let packageFolder = path.join(node_modules, packageName);
        return packageFolder;
    }
}
exports.default = new PackageJsonManager();
//# sourceMappingURL=packageJsonManager.js.map