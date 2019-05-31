"use strict";
const vscode = require("vscode");
class ReferenceProvider {
    constructor(stylesheetManager) {
        this.stylesheetManager = stylesheetManager;
    }
    provideReferences(document, position, context, token) {
        let start = new vscode.Position(0, 0);
        let range = new vscode.Range(start, position);
        let text = document.getText(range);
        let tag = this.stylesheetManager.htmlRegex[0].exec(text);
        let a;
        vscode.workspace.findFiles('**/*.html', '').then((uris) => {
            for (let i = 0; i < uris.length; i++) {
                let uri = uris[i];
                vscode.workspace.openTextDocument(uri).then(doc => {
                });
            }
        });
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
}
exports.ReferenceProvider = ReferenceProvider;
//# sourceMappingURL=reference.provider.js.map