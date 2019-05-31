"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("./util");
var NgFileType;
(function (NgFileType) {
    NgFileType[NgFileType["Script"] = 0] = "Script";
    NgFileType[NgFileType["Template"] = 1] = "Template";
    NgFileType[NgFileType["Style"] = 2] = "Style";
    NgFileType[NgFileType["Spec"] = 3] = "Spec";
})(NgFileType = exports.NgFileType || (exports.NgFileType = {}));
class NgObjectType {
    constructor(identifier, label, possibleFileTypes) {
        this.identifier = identifier;
        this.label = label;
        this.possibleFileTypes = possibleFileTypes;
    }
    static getByIdentifier(identifier) {
        let type = this.types.find(type => {
            return type.identifier === identifier;
        });
        if (!type) {
            type = this.types[0];
        }
        return type;
    }
    has(fileType) {
        return this.possibleFileTypes.indexOf(fileType) > -1;
    }
}
NgObjectType.types = [
    new NgObjectType('component', 'Components', [NgFileType.Script, NgFileType.Template, NgFileType.Style, NgFileType.Spec]),
    new NgObjectType('service', 'Services', [NgFileType.Script, NgFileType.Spec]),
    new NgObjectType('module', 'Modules', [NgFileType.Script])
];
exports.NgObjectType = NgObjectType;
class NgObject {
    constructor(name, type, scriptDir, files) {
        this.name = name;
        this.type = type;
        this.scriptDir = scriptDir;
        this.files = files;
    }
    static fromScriptUri(uri) {
        const uriParts = uri.toString().split('/');
        const scriptFileName = uriParts[uriParts.length - 1];
        const scriptFileNameParts = scriptFileName.split('.');
        const name = scriptFileName.slice(0, scriptFileName.length - 3);
        const type = NgObjectType.getByIdentifier(scriptFileNameParts[scriptFileNameParts.length - 1]);
        const scriptDir = vscode.Uri.parse(uriParts.slice(0, uriParts.length - 1).join('/'));
        const files = NgFileCollection.create(uri, name, type, scriptDir);
        return new NgObject(name, type, scriptDir, files);
    }
}
exports.NgObject = NgObject;
class NgFileCollection {
    constructor(script) {
        this.script = script;
    }
    static create(scriptUri, name, type, scriptDir) {
        const collection = new NgFileCollection(scriptUri);
        //collection.ngObject = NgObject.fromScriptUri(scriptUri);
        collection.loadFiles(name, type, scriptDir);
        return collection;
    }
    loadFiles(name, type, scriptDir) {
        // Get Template and Styles from Decorator
        if (type.has(NgFileType.Template) || type.has(NgFileType.Style)) {
            vscode.workspace.openTextDocument(this.script).then(doc => {
                const matchDecorator = doc.getText().match(/@(.*?)\s*?\({[\s\n]*([^]*?)[\s\n]*?}\)/);
                if (matchDecorator) {
                    const decoratorContent = matchDecorator[2];
                    if (decoratorContent) {
                        // Get Template
                        if (type.has(NgFileType.Template)) {
                            this.template = this.getTemplateFile(decoratorContent, scriptDir);
                        }
                        // Get Styles
                        if (type.has(NgFileType.Style)) {
                            this.styles = this.getStyleFiles(decoratorContent, scriptDir);
                        }
                    }
                }
            });
        }
        // Find Spec File
        if (type.has(NgFileType.Spec)) {
            this.getSpecFile(name, scriptDir).then(uri => this.spec = uri);
        }
    }
    getSpecFile(ngObjectName, scriptDir) {
        return new Promise((resolve, reject) => {
            vscode.workspace.openTextDocument(vscode.Uri.parse(scriptDir.toString() + '/' + ngObjectName + '.spec.ts')).then(doc => {
                console.log('SPEC: ' + ngObjectName + ' (local): ' + doc.uri);
                resolve(doc.uri);
            }, reason => {
                util_1.Util.findFile('src/**/' + ngObjectName + '.spec.ts').then(uri => {
                    console.log('SPEC: ' + ngObjectName + ' (global): ' + uri);
                    resolve(uri);
                });
            });
        });
    }
    getTemplateFile(decoraterContent, scriptDir) {
        let matchTemplateUrl = decoraterContent.match(/templateUrl:\s*?'(.*?)'/);
        if (!matchTemplateUrl) {
            matchTemplateUrl = decoraterContent.match(/templateUrl:\s*?"(.*?)"/);
            if (!matchTemplateUrl) {
                return;
            }
        }
        const templateUrl = matchTemplateUrl[1];
        if (!templateUrl) {
            return;
        }
        return vscode.Uri.parse(util_1.Util.getAbsolutePath(scriptDir.toString(), templateUrl));
    }
    getStyleFiles(decoraterContent, scriptDir) {
        const matchStyleList = decoraterContent.match(/styleUrls:\s*?\[([^]*?)\]/);
        if (!matchStyleList) {
            return [];
        }
        let styleUris = [];
        let stylePaths = matchStyleList[1].replace(/'/g, '').replace(/"/g, '').split(',');
        for (let i = 0; i < stylePaths.length; i++) {
            stylePaths[i] = stylePaths[i].trim();
            styleUris.push(vscode.Uri.parse(util_1.Util.getAbsolutePath(scriptDir.toString(), stylePaths[i])));
        }
        return styleUris;
    }
}
exports.NgFileCollection = NgFileCollection;
//# sourceMappingURL=ngUtil.js.map