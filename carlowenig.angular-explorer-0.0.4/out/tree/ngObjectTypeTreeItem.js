"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const ngTreeItem_1 = require("./ngTreeItem");
const ngObjectType_1 = require("../obj/ngObjectType");
class NgObjectTypeTreeItem extends ngTreeItem_1.NgTreeItem {
    constructor(type) {
        super(type.label, vscode.TreeItemCollapsibleState.None);
        this.type = type;
        this.count = 0;
    }
    setLabelInfo(info) {
        this.label = this.type.label + ' (' + info + ')';
    }
    increaseObjectCount() {
        this.count++;
        this.setLabelInfo('' + this.count);
        if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
            this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        }
    }
}
NgObjectTypeTreeItem.scanningTreeItem = new NgObjectTypeTreeItem(new ngObjectType_1.NgObjectType('', 'Scanning...', []));
NgObjectTypeTreeItem.noFilesTreeItem = new NgObjectTypeTreeItem(new ngObjectType_1.NgObjectType('', 'No Angular files found', []));
exports.NgObjectTypeTreeItem = NgObjectTypeTreeItem;
//# sourceMappingURL=ngObjectTypeTreeItem.js.map