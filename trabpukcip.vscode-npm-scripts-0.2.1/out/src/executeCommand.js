"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const Message = require("./messages");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
function executeCommand(terminalMapping) {
    return function (task, cwd) {
        const packageManager = vscode_1.workspace.getConfiguration("npm").get("packageManager") || "npm";
        const command = `${packageManager} run ${task}`;
        const config = vscode_1.workspace.getConfiguration(constants_1.NPM_SCRIPTS);
        if (config[constants_1.ConfigOptions.showStart]) {
            const hideMessages = { title: Message.HideMessages };
            vscode.window
                .showInformationMessage(command, hideMessages)
                .then((result) => {
                if (result === hideMessages) {
                    config.update(constants_1.ConfigOptions.showStart, false, false);
                    vscode.window.showInformationMessage(Message.HideMessagesExtra);
                }
            });
        }
        const name = utils_1.makeTerminalPrettyName(cwd, task);
        let terminal;
        if (terminalMapping.has(name)) {
            terminal = terminalMapping.get(name);
        }
        else {
            const terminalOptions = { cwd, name };
            terminal = vscode.window.createTerminal(terminalOptions);
            terminalMapping.set(name, terminal);
        }
        terminal.show();
        terminal.sendText(command);
    };
}
exports.executeCommand = executeCommand;
//# sourceMappingURL=executeCommand.js.map