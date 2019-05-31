"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const util_1 = require("../util");
const ngFileType_1 = require("./ngFileType");
class NgFileCollection {
    constructor(scriptUri) {
        this.scriptUri = scriptUri;
    }
    static create(scriptUri, name, type, scriptDir) {
        return new Promise((resolve, reject) => {
            const collection = new NgFileCollection(scriptUri);
            let promises = [];
            // const startTime = new Date().getTime();
            // Get Decorator
            promises.push(vscode.workspace.openTextDocument(scriptUri).then(doc => {
                // console.log('---> Opened Document of ' + name + '.' + type.identifier + ', needed ' + ((new Date().getTime() - startTime) / 1000) + 's');
                const matchDecorator = doc.getText().match(/@(.*?)\s*?\([\s\n]*([^]*?)[\s\n]*?\)/);
                if (matchDecorator) {
                    collection.decorator = matchDecorator[0];
                    const decoratorContent = matchDecorator[2];
                    if (decoratorContent) {
                        // Get Template
                        if (type.has(ngFileType_1.NgFileType.Template)) {
                            promises.push(this.getTemplateFile(decoratorContent, scriptDir)
                                .then(uri => collection.templateUri = uri)
                                .catch(reason => console.log(name + ': No Template File found')));
                        }
                        // Get Styles
                        if (type.has(ngFileType_1.NgFileType.Style)) {
                            promises.push(this.getStyleFiles(decoratorContent, scriptDir)
                                .then(uri => collection.styleUris = uri)
                                .catch(reason => console.log(name + ': No Style Files found')));
                        }
                    }
                }
            }));
            // Find Spec File
            if (type.has(ngFileType_1.NgFileType.Spec)) {
                promises.push(this.getSpecFile(name, type.identifier, scriptDir)
                    .then(uri => collection.specUri = uri)
                    .catch(reason => console.log(name + ': No Spec File found')));
            }
            Promise.all(promises).then(values => {
                // console.log('--> Created FileCollection of ' + name + '.' + type.identifier + ', needed ' + ((new Date().getTime() - startTime) / 1000) + 's');
                resolve(collection);
            }, reason => reject(reason));
        });
    }
    static getSpecFile(name, identifier, scriptDir) {
        return new Promise((resolve, reject) => {
            const fileName = name + '.' + identifier + '.spec.ts';
            vscode.workspace.openTextDocument(vscode.Uri.parse(scriptDir.toString() + '/' + fileName)).then(doc => resolve(doc.uri), reason => {
                util_1.Util.findFile(fileName).then(uri => resolve(uri), reason => reject(reason));
            });
        });
    }
    static getTemplateFile(decoraterContent, scriptDir) {
        return new Promise((resolve, reject) => {
            let matchTemplateUrl = decoraterContent.match(/templateUrl:\s*?'(.*?)'/);
            if (!matchTemplateUrl) {
                matchTemplateUrl = decoraterContent.match(/templateUrl:\s*?"(.*?)"/);
                if (!matchTemplateUrl) {
                    reject('Template not found');
                    return;
                }
            }
            const templateUrl = matchTemplateUrl[1];
            if (!templateUrl) {
                reject('Template Url not valid');
                return;
            }
            resolve(vscode.Uri.parse(util_1.Util.getAbsolutePath(scriptDir.toString(), templateUrl)));
        });
    }
    static getStyleFiles(decoraterContent, scriptDir) {
        return new Promise((resolve, reject) => {
            const matchStyleList = decoraterContent.match(/styleUrls:\s*?\[([^]*?)\]/);
            if (!matchStyleList) {
                reject('No styleList found');
                return;
            }
            let styleUris = [];
            let stylePaths = matchStyleList[1].replace(/'/g, '').replace(/"/g, '').split(',');
            for (let i = 0; i < stylePaths.length; i++) {
                stylePaths[i] = stylePaths[i].trim();
                styleUris.push(vscode.Uri.parse(util_1.Util.getAbsolutePath(scriptDir.toString(), stylePaths[i])));
            }
            resolve(styleUris);
        });
    }
}
exports.NgFileCollection = NgFileCollection;
//# sourceMappingURL=ngFileCollection.js.map