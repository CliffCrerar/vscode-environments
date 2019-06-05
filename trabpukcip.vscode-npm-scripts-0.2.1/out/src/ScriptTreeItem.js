"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path_1 = require("path");
class ScriptTreeItem extends vscode_1.TreeItem {
    constructor(label, collapsibleState, tooltip, command) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.tooltip = tooltip;
        this.command = command;
        this.iconPath = {
            light: path_1.join(__filename, "..", "..", "..", "resources", "light", "file_type_npm.svg"),
            dark: path_1.join(__filename, "..", "..", "..", "resources", "dark", "file_type_npm.svg")
        };
        this.contextValue = "script";
    }
}
exports.ScriptTreeItem = ScriptTreeItem;
//# sourceMappingURL=ScriptTreeItem.js.map