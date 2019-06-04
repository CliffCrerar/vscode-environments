"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const executeCommand_1 = require("../../executeCommand");
function add() {
    vscode.window
        .showInputBox({ placeHolder: " The name of the migration" })
        .then(name => {
        executeCommand_1.executeCommandInOutputChannel(["ef migrations add", name], true, false);
    });
}
exports.add = add;
//# sourceMappingURL=add.js.map