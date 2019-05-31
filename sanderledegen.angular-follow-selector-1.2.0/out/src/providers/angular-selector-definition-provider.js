"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
class AngularSelectorDefinitionProvider {
    provideDefinition(document, position) {
        const wordRange = document.getWordRangeAtPosition(position);
        const clickedTag = document.getText(wordRange);
        const findTagInDocumentRegex = new RegExp(`selector:\\s?(['"])\\[?${clickedTag}\\]?\\1`, 'i');
        // const findInputAttributeInDocumentRegex = new RegExp(`@Input\\(['"]?\\\w*['"]?\\)\\s+${clickedTag}`)
        return vscode.workspace.findFiles('{**/*.component.ts,**/*.directive.ts}', 'node_modules/*')
            .then(tsFiles => {
            return tsFiles.map(file => {
                return vscode.workspace.openTextDocument(vscode_1.Uri.file(file.fsPath))
                    .then(document => {
                    const tagMatch = findTagInDocumentRegex.test(document.getText());
                    // const attributeMatch = findInputAttributeInDocumentRegex.test(document.getText())
                    let lineNumber = 0;
                    let colNumber = 0;
                    if (tagMatch) {
                        const componentName = clickedTag.substring(clickedTag.indexOf('-')).replace(/-/g, '').toLowerCase();
                        const lines = document.getText().split('\n');
                        lines.forEach((line, index) => {
                            if (line.includes('class') && line.toLowerCase().includes(`${componentName}`)) {
                                lineNumber = index;
                            }
                        });
                    }
                    // if (attributeMatch) {
                    //   const lines = document.getText().split('\n')
                    //   lines.forEach((line, index) => {
                    //     if (line.includes('@Input(') && line.includes(clickedTag)) {
                    //       lineNumber = index
                    //       colNumber = line.indexOf('@Input(')
                    //     } else if (line.includes(clickedTag) && index > 0 && lines[index - 1].includes('@Input(')) {
                    //       lineNumber = index
                    //       colNumber = line.indexOf(clickedTag)
                    //     }
                    //   })
                    // }
                    return {
                        path: file.fsPath,
                        match: tagMatch,
                        lineNumber,
                        colNumber,
                    };
                });
            });
        })
            .then(mappedTsFiles => {
            return Promise.all(mappedTsFiles)
                .then(tsFileObjects => {
                const matchedTsFileObject = tsFileObjects.find((mo => mo.match));
                return matchedTsFileObject ? matchedTsFileObject : null;
            });
        })
            .then(tagDefinitionPath => {
            if (tagDefinitionPath === null) {
                // Returning null prevents the tag from being underlined, which makes sense as there's no tag definition match.
                return null;
            }
            // Returning a location gives VS Code a hint where to jump to when Ctrl/Cmd + click is invoked on the tag.
            return new vscode_1.Location(vscode_1.Uri.file(tagDefinitionPath.path), new vscode_1.Position(tagDefinitionPath.lineNumber, tagDefinitionPath.colNumber));
        });
    }
}
exports.AngularSelectorDefinitionProvider = AngularSelectorDefinitionProvider;
//# sourceMappingURL=angular-selector-definition-provider.js.map