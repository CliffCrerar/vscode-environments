"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const executeCommand_1 = require("../../executeCommand");
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
function build() {
    buildConfiguration();
}
exports.build = build;
function buildConfiguration() {
    vscode.window.showQuickPick(items, options).then(data => {
        vscode.window
            .showInputBox({
            placeHolder: "Enter optional paramaters if any, example --runtime ubuntu.16.04-x64"
        })
            .then(optionalParams => {
            executeCommand_1.executeCommandInOutputChannel(["build", "--configuration " + data.label, optionalParams], true, false);
        });
    });
}
//# sourceMappingURL=build.1.js.map