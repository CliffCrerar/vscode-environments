"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cp = require("child_process");
const extension_1 = require("./extension");
function runCommand(args, showOutputChannel, showInformationMessage) {
    let cmd = "dotnet " + args.join(" ");
    var childProcess = cp.exec(cmd, {
        cwd: vscode.workspace.rootPath,
        env: process.env
    });
    showOutput(childProcess, cmd, showOutputChannel, showInformationMessage);
    return {
        stderr: childProcess.stderr,
        stdout: childProcess.stdout
    };
}
exports.runCommand = runCommand;
function showOutput(childProcess, cmd, showOutputChannel, showInformationMessage) {
    extension_1.outputTerminal.show(true);
    if (showOutputChannel) {
        extension_1.outputTerminal.sendText("Command: " + cmd + "\n");
        extension_1.outputTerminal.sendText("-----------------------------------------------\n");
    }
    childProcess.stderr.on("data", (data) => {
        if (showOutputChannel) {
            extension_1.outputTerminal.sendText(data);
        }
    });
    childProcess.stdout.on("data", (data) => {
        // if (showOutputChannel) {
        //   outputTerminal.sendText(data);
        // }
        if (showInformationMessage) {
            vscode.window.showInformationMessage(data);
        }
    });
}
//# sourceMappingURL=run.js.map