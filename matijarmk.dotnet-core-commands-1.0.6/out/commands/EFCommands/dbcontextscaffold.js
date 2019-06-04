"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const executeCommand_1 = require("../../executeCommand");
function dbcontextScaffold() {
    vscode.window
        .showInputBox({
        placeHolder: "Connection string {Server=.\\SQLEXPRESS;Database=dbname;Trusted_Connection=True;MultipleActiveResultSets=true}",
        ignoreFocusOut: true
    })
        .then(connectionString => {
        if (connectionString != undefined && connectionString != "") {
            vscode.window
                .showInputBox({
                placeHolder: "Provider {Microsoft.EntityFrameworkCore.SqlServe}",
                ignoreFocusOut: true
            })
                .then(provider => {
                if (provider != undefined && connectionString != "") {
                    executeCommand_1.executeCommandInOutputChannel(["ef dbcontext scaffold", `"${connectionString}"`, provider], true, false);
                }
            });
        }
    });
}
exports.dbcontextScaffold = dbcontextScaffold;
//# sourceMappingURL=dbcontextscaffold.js.map