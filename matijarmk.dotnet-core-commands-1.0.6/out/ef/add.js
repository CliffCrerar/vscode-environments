'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const run_1 = require("../run");
exports.ngnew = vscode.commands.registerCommand('extension.ngNew', () => {
    let project = vscode.window.showInputBox({ placeHolder: 'name of migration' }).then((data) => {
        run_1.runNgCommand(['new', data], true);
    });
});
//# sourceMappingURL=add.js.map