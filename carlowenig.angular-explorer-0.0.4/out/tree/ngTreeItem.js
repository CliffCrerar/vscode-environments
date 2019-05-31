"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class NgTreeItem extends vscode.TreeItem {
    constructor(label, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
    }
    get tooltip() {
        return this.info;
    }
}
exports.NgTreeItem = NgTreeItem;
//# sourceMappingURL=ngTreeItem.js.map