"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ngUtil_1 = require("./ngUtil");
class AngularDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.aeTreeItems = new Map();
        this.loadAllAngularObjects();
        vscode.workspace.onDidChangeTextDocument(e => {
            this._onDidChangeTreeData.fire();
        });
    }
    getTreeItem(treeItem) {
        return treeItem;
    }
    getChildren(treeItem) {
        return new Promise(resolve => {
            if (treeItem) {
                // if directly under NgObjectType
                if (treeItem instanceof NgObjectTypeTreeItem) {
                    const type = ngUtil_1.NgObjectType.getByIdentifier(treeItem.type.identifier);
                    if (type) {
                        resolve(this.aeTreeItems.get(type));
                    }
                }
            }
            else {
                // if in root (-> ObjectTypes)
                let items = [];
                for (let type of ngUtil_1.NgObjectType.types) {
                    items.push(new NgObjectTypeTreeItem(type));
                }
                resolve(items);
            }
        });
    }
    loadAllAngularObjects() {
        for (let type of ngUtil_1.NgObjectType.types) {
            this.loadAngularObjects(type);
        }
    }
    loadAngularObjects(type) {
        vscode.workspace.findFiles('src/**/*.' + type.identifier + '.ts').then(uris => {
            let items = [];
            let msg = uris.length + ' ' + type.label + ' found:\n';
            for (let uri of uris) {
                const pathParts = uri.path.split('/');
                const fileName = pathParts[pathParts.length - 1];
                const fileNameParts = fileName.split('.');
                const objName = fileNameParts.slice(0, fileNameParts.length - 2).join('.');
                msg += `${objName} (${fileName})\n`;
                items.push(new NgObjectTreeItem(objName, uri, type));
            }
            vscode.window.showInformationMessage(msg);
            this.aeTreeItems.set(type, items);
        });
    }
}
exports.AngularDataProvider = AngularDataProvider;
class AETreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState, info) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.info = info;
    }
    get tooltip() {
        return this.info;
    }
}
class NgObjectTypeTreeItem extends AETreeItem {
    constructor(type) {
        super(type.label, vscode.TreeItemCollapsibleState.Collapsed);
        this.type = type;
    }
}
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
//# sourceMappingURL=angularDataProvider.js.map