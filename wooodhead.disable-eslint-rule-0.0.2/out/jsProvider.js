'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** reference: vscode-hlint */
const path = require("path");
const fs = require("fs-extra");
const vscode = require("vscode");
class HaskellLintingProvider {
    activate(subscriptions) {
        this.command = vscode.commands.registerCommand(HaskellLintingProvider.commandId, this.runAddRullAction, this);
        // this.reactCommand = vscode.commands.registerCommand(HaskellLintingProvider.reactCommandId, this.runAddRullAction, this);
        subscriptions.push(this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
    }
    dispose() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        this.command.dispose();
    }
    provideCodeActions(document, range, context, token) {
        let diagnostic = context.diagnostics[0];
        if (diagnostic.source === 'eslint') {
            return [{
                    title: `Disable eslint rule (${diagnostic.code})`,
                    command: HaskellLintingProvider.commandId,
                    arguments: [document, diagnostic]
                }];
        }
        else {
            return null;
        }
    }
    runAddRullAction(document, diagnostic) {
        const ruleID = diagnostic.code;
        let folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            vscode.window.showErrorMessage('Need a opened workspace folder.');
            return;
        }
        const configFilePaths = [];
        let hasConfigFolders = folders.filter(folder => {
            // let configFiles = ['.eslintrc', '.eslintrc.json', '.eslintrc.js', '.eslintrc.yaml', '.eslintrc.yml'];
            let configFiles = ['.eslintrc', '.eslintrc.json'];
            for (let configFile of configFiles) {
                const filePath = path.join(folder.uri.fsPath, configFile);
                if (fs.existsSync(filePath)) {
                    configFilePaths.push(filePath);
                    return true;
                }
            }
            return false;
        });
        if (configFilePaths.length > 0) {
            const filePath = configFilePaths[0];
            const eslintFile = fs.readJsonSync(filePath);
            if (eslintFile.rules) {
                delete eslintFile.rules[ruleID];
                eslintFile.rules[ruleID] = 0;
            }
            fs.writeJson(filePath, eslintFile, { spaces: 4 });
        }
    }
}
HaskellLintingProvider.commandId = 'javascript.runCodeAction';
exports.default = HaskellLintingProvider;
//# sourceMappingURL=jsProvider.js.map