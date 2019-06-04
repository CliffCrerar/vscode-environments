"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const run_1 = require("../run");
exports.migrations = vscode.commands.registerCommand("extension.Dotnet", () => {
    let param = ["ef migrations"];
    let items = ["add", "list", "remove", "script"];
    let options = { matchOnDescription: false, placeHolder: "select Type" };
    vscode.window.showQuickPick(items, options).then(data => {
        param.push(data);
        if (data == "add") {
            vscode.window
                .showInputBox({ placeHolder: " The name of the migration" })
                .then(name => {
                param.push(name);
                run_1.runCommandInOutputWindow(param);
            });
        }
        else {
            run_1.runCommandInOutputWindow(param);
        }
    });
});
//# sourceMappingURL=addmigration.js.map