"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ngObjectType_1 = require("./ngObjectType");
const ngFileCollection_1 = require("./ngFileCollection");
class NgObject {
    constructor(name, type, scriptDir, files) {
        this.name = name;
        this.type = type;
        this.scriptDir = scriptDir;
        this.files = files;
    }
    static fromScriptUri(uri) {
        return new Promise((resolve, reject) => {
            const uriParts = uri.toString().split('/');
            const scriptFileName = uriParts[uriParts.length - 1];
            const scriptFileNameParts = scriptFileName.split('.');
            const name = scriptFileNameParts.slice(0, scriptFileNameParts.length - 2).join('.'); //scriptFileName.slice(0, scriptFileName.length - 3);
            const identifier = scriptFileNameParts[scriptFileNameParts.length - 2];
            const type = ngObjectType_1.NgObjectType.getByIdentifier(identifier);
            if (type) {
                const scriptDir = vscode.Uri.parse(uriParts.slice(0, uriParts.length - 1).join('/'));
                ngFileCollection_1.NgFileCollection.create(uri, name, type, scriptDir).then(collection => {
                    resolve(new NgObject(name, type, scriptDir, collection));
                });
            }
            else {
                reject('Uri has no valid identifier (' + identifier + ')');
            }
        });
    }
}
exports.NgObject = NgObject;
//# sourceMappingURL=ngObject.js.map