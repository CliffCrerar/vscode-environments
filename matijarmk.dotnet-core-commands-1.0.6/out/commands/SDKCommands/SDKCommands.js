"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function SDKCommands() {
    let param = ["ef migrations"];
    let items = ["new", "restore", "run", "build", "publish", "version"];
    let options = { matchOnDescription: false, placeHolder: "select Type" };
    vscode.window.showQuickPick(items, options).then(data => {
    });
}
exports.SDKCommands = SDKCommands;
//# sourceMappingURL=SDKCommands.js.map