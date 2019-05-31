"use strict";
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class ConfigurationManager {
    constructor(context) {
        this.context = context;
        this.getConfiguration();
    }
    getConfiguration() {
        if (this.configuration) {
            return this.configuration;
        }
        this.findOptionsJson();
        this.configuration = vscode.workspace.getConfiguration('htmlScss');
        return this.configuration;
    }
    setConfigChangeListener(callback) {
        let onConfigChange = vscode.workspace.onDidChangeConfiguration(() => {
            this.configuration = vscode.workspace.getConfiguration('htmlScss');
            callback();
        });
        this.context.subscriptions.push(onConfigChange);
    }
    findOptionsJson() {
        let optionsJson = path.resolve(vscode.workspace.rootPath, 'scss-options.json');
        fs.readFile(optionsJson, 'utf8', (err, data) => {
            if (!err) {
                let messageItem = {
                    title: 'Open Settings',
                    isCloseAffordance: true
                };
                vscode.window.showInformationMessage('The scss-options.json file is now deprecated. Please use the new workspace settings :)', messageItem).then(btn => {
                    if (!btn) {
                        return;
                    }
                    vscode.commands.executeCommand('workbench.action.openWorkspaceSettings');
                });
            }
        });
    }
}
exports.ConfigurationManager = ConfigurationManager;
//# sourceMappingURL=configuration.manager.js.map