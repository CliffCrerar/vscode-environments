"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const angular_selector_definition_provider_1 = require("./providers/angular-selector-definition-provider");
const angular_url_definition_provider_1 = require("./providers/angular-url-definition-provider");
function activate(context) {
    const selectorRegistration = vscode.languages.registerDefinitionProvider({
        language: 'html',
        pattern: '**/*.component.html',
        scheme: 'file',
    }, new angular_selector_definition_provider_1.AngularSelectorDefinitionProvider());
    const urlRegistration = vscode.languages.registerDefinitionProvider({
        language: 'typescript',
        pattern: '**/*.component.ts',
        scheme: 'file',
    }, new angular_url_definition_provider_1.AngularUrlDefinitionProvider());
    context.subscriptions.push(selectorRegistration, urlRegistration);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map