'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const generate_1 = require("./generate");
function activate(context) {
    // 自动化生成代码工具
    let ngGenerate = vscode.commands.registerCommand('extension.ngGenerate', (args) => {
        // 选择自动生成的类型 component, service...
        generate_1.Generate.showPickTypeDialog(args)
            .then(generate_1.Generate.showFileNameDialog)
            .then(generate_1.Generate.generateComponent)
            .catch((error) => {
            vscode.window.showErrorMessage(error);
        });
    });
    context.subscriptions.push(ngGenerate);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map