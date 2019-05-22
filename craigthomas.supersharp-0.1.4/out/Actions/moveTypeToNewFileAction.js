'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const superSharp_1 = require("../superSharp");
const TypeElement_1 = require("../System/CSharp/TypeElement");
class MoveTypeToNewFileAction {
    tryGetCommand(document, range) {
        if (!range.isSingleLine) {
            return null;
        }
        var typeName = TypeElement_1.default.tryGetSelectedTypeName(document, range);
        if (typeName) {
            let command = {
                title: `Move ${typeName} to new file`,
                command: MoveTypeToNewFileAction.actionId,
                arguments: [document, range]
            };
            return command;
        }
        return null;
    }
    executeAction(document, range) {
        var type = TypeElement_1.default.fromCursorPosition(document, range.start);
        if (type == null) {
            vscode.window.showInformationMessage('Unable to determine Type');
            return;
        }
        var filePath = path.join(path.dirname(document.fileName), type.name + ".cs");
        var namespace = this.tryFindCurrentNamespace(document);
        this.createNewTypeDocument(namespace, type.text, type.name, filePath);
        type.deleteFromDocument();
    }
    tryFindCurrentNamespace(document) {
        let readonlyRegex = new RegExp(/namespace\s([\w\.]+)/g);
        let text = document.getText();
        let match = readonlyRegex.exec(text);
        if (match != null)
            return match[1];
        return "";
    }
    createNewTypeDocument(namespace, typeDefinition, typeName, saveToPath) {
        if (fs.existsSync(saveToPath)) {
            vscode.window.showErrorMessage("File " + typeName + ".cs" + " already exists");
            return;
        }
        var templatePath = path.join(vscode.extensions.getExtension(superSharp_1.default.namespace).extensionPath + '/templates/newType.tmpl');
        var updateTemplate = (templateDocument) => {
            let templateText = templateDocument.getText();
            templateText = templateText.replace('${namespace}', namespace);
            templateText = templateText.replace('${tyedefinition}', typeDefinition);
            fs.writeFileSync(saveToPath, templateText);
            //var timer = setTimeout(() => { this.openDocument(filePath) }, 2000);
        };
        vscode.workspace.openTextDocument(templatePath).then(updateTemplate);
    }
}
MoveTypeToNewFileAction.actionId = 'supersharp.moveTypeToFile';
MoveTypeToNewFileAction.actionTitle = "Move type to file";
exports.default = MoveTypeToNewFileAction;
//# sourceMappingURL=moveTypeToNewFileAction.js.map