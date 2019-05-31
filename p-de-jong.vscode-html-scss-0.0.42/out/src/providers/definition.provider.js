"use strict";
const vscode = require("vscode");
class DefinitionProvider {
    constructor(stylesheetManager) {
        this.stylesheetManager = stylesheetManager;
    }
    provideDefinition(document, position, token) {
        let currentRange = document.getWordRangeAtPosition(position);
        let property = document.getText(currentRange);
        let locations = new Array();
        let localPaths = this.stylesheetManager.findInMap(this.stylesheetManager.localMap, property);
        let globalPaths = this.stylesheetManager.findInMap(this.stylesheetManager.globalMap, property);
        let combinedPaths = [...localPaths, ...globalPaths];
        return new Promise((resolve, reject) => {
            if (combinedPaths.length === 0) {
                resolve(locations);
            }
            combinedPaths = combinedPaths.filter((item, index, input) => {
                return input.indexOf(item) === index;
            });
            for (let i = 0; i < combinedPaths.length; i++) {
                let path = combinedPaths[i];
                let uri = vscode.Uri.file(path);
                this.stylesheetManager.findLocation(property, uri).then(location => {
                    if (location) {
                        locations.push(location);
                    }
                    if (i === combinedPaths.length - 1) {
                        resolve(locations);
                    }
                });
            }
        });
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definition.provider.js.map