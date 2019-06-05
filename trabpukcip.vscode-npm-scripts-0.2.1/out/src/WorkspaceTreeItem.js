"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class WorkspaceTreeItem extends vscode_1.TreeItem {
    constructor(label, collapsibleState, tooltip, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.tooltip = tooltip;
        this.command = command;
        this.iconPath = vscode_1.ThemeIcon.Folder;
        this.contextValue = "workspaceFolder";
    }
}
exports.WorkspaceTreeItem = WorkspaceTreeItem;
//# sourceMappingURL=WorkspaceTreeItem.js.map