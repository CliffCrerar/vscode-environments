"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ngObjectTreeItem_1 = require("./ngObjectTreeItem");
const ngObjectTypeTreeItem_1 = require("./ngObjectTypeTreeItem");
const ngObjectType_1 = require("../obj/ngObjectType");
const ngObject_1 = require("../obj/ngObject");
const util_1 = require("../util");
class AngularDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.ngObjectTypeTreeItems = new Map();
        this.ngObjectTreeItems = new Map();
        this.lastCollapsibleStates = new Map();
        this.refresh();
        /*
        vscode.workspace.onDidChangeWorkspaceFolders(e => {
            this.loadTreeItems();
            this._onDidChangeTreeData.fire();
        });*/
        vscode.workspace.onDidChangeConfiguration(e => {
            this.refresh();
        });
    }
    refresh() {
        this.loadTreeItems();
    }
    getTreeItem(treeItem) {
        return treeItem;
    }
    getChildren(treeItem) {
        return new Promise(resolve => {
            if (treeItem) /* if not in root */ {
                if (treeItem instanceof ngObjectTypeTreeItem_1.NgObjectTypeTreeItem && treeItem.type) {
                    const items = this.ngObjectTreeItems.get(treeItem.type);
                    if (items) {
                        items.sort((a, b) => {
                            return a.label > b.label ? 1 : a.label < b.label ? -1 : 0;
                        });
                    }
                    resolve(items);
                }
            }
            else /* if in root (-> ObjectTypes) */ {
                const items = Array.from(this.ngObjectTypeTreeItems.values()).sort((a, b) => {
                    return b.type.priority - a.type.priority;
                });
                /*items.forEach(item => {
                    const lastState = this.lastCollapsibleStates.get(item.type);
                    if (lastState) {
                        item.collapsibleState = lastState;
                        console.log('last state of ' + item.type.label + ' was ' + lastState);

                    }
                });*/
                if (!items.length) {
                    items.push(ngObjectTypeTreeItem_1.NgObjectTypeTreeItem.noFilesTreeItem);
                }
                //console.log('-> Show Children (' + (new Date().getTime() - Util.startTime) + 'ms)');
                resolve(items);
            }
        });
    }
    loadTreeItems() {
        for (let type of ngObjectType_1.NgObjectType.types) {
            this.loadNgObjectTreeItemsByType(type);
        }
    }
    loadNgObjectTreeItemsByType(type) {
        this.ngObjectTypeTreeItems.clear();
        this.setScanningEnabled(true);
        //console.log('-> Start Script Search (' + (new Date().getTime() - Util.startTime) + 'ms)');
        util_1.Util.findFiles('/*.' + type.identifier + '.ts').then(uris => {
            this.ngObjectTreeItems.set(type, []);
            //console.log('-> Start Object Initialization (' + (new Date().getTime() - Util.startTime) + 'ms)');
            if (!uris.length) {
                this._onDidChangeTreeData.fire();
                return;
            }
            let promises = [];
            for (let uri of uris) {
                promises.push(this.getNgObjectTreeItem(uri).then(treeItem => {
                    const treeItems = this.ngObjectTreeItems.get(type);
                    if (treeItems) {
                        treeItems.push(treeItem);
                        if (!this.ngObjectTypeTreeItems.has(type)) {
                            this.ngObjectTypeTreeItems.set(type, new ngObjectTypeTreeItem_1.NgObjectTypeTreeItem(type));
                        }
                        const ngObjectTypeTreeItem = this.ngObjectTypeTreeItems.get(type);
                        if (ngObjectTypeTreeItem) {
                            ngObjectTypeTreeItem.increaseObjectCount();
                        }
                        this.ngObjectTypeTreeItems.forEach((val, key) => {
                            this.lastCollapsibleStates.set(key, val.collapsibleState);
                        });
                        //this._onDidChangeTreeData.fire();
                    }
                }, reason => console.log(reason)).catch(reason => { }));
            }
            Promise.all(promises).then(value => {
                this.setScanningEnabled(false);
                // console.log('-> Finished Object Initialization of ' + type.label + ' (' + (new Date().getTime() - Util.startTime) + 'ms)');
            });
        }).catch(reason => {
            this.setScanningEnabled(false);
        });
    }
    setScanningEnabled(enabled) {
        if (enabled) {
            this.ngObjectTypeTreeItems.set(ngObjectTypeTreeItem_1.NgObjectTypeTreeItem.scanningTreeItem.type, ngObjectTypeTreeItem_1.NgObjectTypeTreeItem.scanningTreeItem);
        }
        else {
            this.ngObjectTypeTreeItems.delete(ngObjectTypeTreeItem_1.NgObjectTypeTreeItem.scanningTreeItem.type);
        }
        this._onDidChangeTreeData.fire();
    }
    getNgObjectTreeItem(scriptUri) {
        return new Promise((resolve, reject) => {
            ngObject_1.NgObject.fromScriptUri(scriptUri).then(ngObject => resolve(new ngObjectTreeItem_1.NgObjectTreeItem(ngObject)), reason => reject(reason));
        });
    }
}
exports.AngularDataProvider = AngularDataProvider;
//# sourceMappingURL=angularDataProvider.js.map