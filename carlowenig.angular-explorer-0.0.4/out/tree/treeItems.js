"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ngUtil_1 = require("../ngUtil");
class NgObjectTypeTreeItem extends AETreeItem {
    constructor(type) {
        super(type.label, vscode.TreeItemCollapsibleState.Collapsed);
        this.type = type;
    }
}
exports.NgObjectTypeTreeItem = NgObjectTypeTreeItem;
class NgObjectTreeItem extends AETreeItem {
    constructor(name, scriptUri, type) {
        super(name, vscode.TreeItemCollapsibleState.None, scriptUri.fsPath);
        this.name = name;
        this.scriptUri = scriptUri;
        this.type = type;
        this.ngObject = ngUtil_1.NgObject.fromScriptUri(scriptUri);
        this.resourceUri = scriptUri;
        /**
         * Set Command
         */
        this.command = {
            command: 'angularExplorer.openNgObject',
            title: '',
            arguments: [this]
        };
        this.contextValue = 'ngObject.' + this.type.identifier;
        /**
         * Set Icon
         */
        if (name === 'app') {
            this.iconPath = {
                light: __filename + '/../../img/ic_' + type.identifier + '_app.svg',
                dark: __filename + '/../../img/ic_' + type.identifier + '_app.svg',
            };
        }
        else {
            this.iconPath = {
                light: __filename + '/../../img/ic_' + type.identifier + '.svg',
                dark: __filename + '/../../img/ic_' + type.identifier + '.svg'
            };
        }
    }
    getNgObjectName() {
        return this.name + '.' + this.type.identifier;
    }
    getFile(fileType) {
        return new Promise((resolve, reject) => {
            vscode.workspace.findFiles('**/' + this.name + '.' + this.type.identifier + '.' + fileType).then(value => resolve(value[0]), reason => reject(reason));
        });
    }
}
exports.NgObjectTreeItem = NgObjectTreeItem;
//# sourceMappingURL=treeItems.js.map