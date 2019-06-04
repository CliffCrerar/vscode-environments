"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const executeCommand_1 = require("../../executeCommand");
function publish() {
    publishConfiguration();
}
exports.publish = publish;
function publishConfiguration() {
    let items = [
        {
            label: "Debug",
            description: "Defines the build configuration."
        },
        {
            label: "Release",
            description: "Defines the build configuration."
        }
    ];
    let options = {
        matchOnDescription: false,
        placeHolder: "Select build configuration."
    };
    vscode.window.showQuickPick(items, options).then(data => {
        vscode.window
            .showInputBox({
            placeHolder: "Enter optional paramaters if any, example --runtime ubuntu.16.04-x64"
        })
            .then(optionalParams => {
            executeCommand_1.executeCommandInOutputChannel(["publish", "--configuration " + data.label, optionalParams], true, false);
        });
    });
}
//# sourceMappingURL=publish.js.map