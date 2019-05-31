'use strict';
// (c) 2016 Ecmel Ercan
// (c) 2017 Pim de Jong
const vscode = require("vscode");
const providers_1 = require("./providers");
const managers_1 = require("./managers");
function activate(context) {
    let configurationManager = new managers_1.ConfigurationManager(context);
    let stylesheetManager = new managers_1.StylesheetManager();
    let classProvider = new providers_1.ClassProvider(context, configurationManager, stylesheetManager);
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(['html', 'laravel-blade', 'razor', 'vue', 'blade', 'typescript'], classProvider));
    let definitionProvider = new providers_1.DefinitionProvider(stylesheetManager);
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['html', 'laravel-blade', 'razor', 'vue', 'blade', 'typescript'], definitionProvider));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map