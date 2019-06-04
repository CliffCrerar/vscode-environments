"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
let _statusBarItem;
function hideItem() {
    _statusBarItem.text = '';
    _statusBarItem.hide();
}
exports.hideItem = hideItem;
function createItem(projExt, workspaceFolders) {
    const folders = workspaceFolders.map(f => f.name);
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    item.text = projExt;
    item.tooltip = `vsproj enabled for "${projExt}" in folders ${folders.join(", ")}`;
    item.show();
    _statusBarItem = item;
    return item;
}
exports.createItem = createItem;
//# sourceMappingURL=statusbar.js.map