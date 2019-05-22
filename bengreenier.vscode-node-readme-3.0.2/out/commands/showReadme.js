"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const import_1 = require("../parsers/import");
const require_1 = require("../parsers/require");
const vscode_helper_1 = require("../parsers/vscode-helper");
const local_1 = require("../providers/local");
const npm_1 = require("../providers/npm");
const remote_1 = require("../providers/remote");
const extension_1 = require("../extension");
const type_extensions_1 = require("../type-extensions");
exports.id = "showReadme";
function command() {
    let moduleName = vscode.window.activeTextEditor ? scanDocument(vscode.window.activeTextEditor) : null;
    if (moduleName == null) {
        vscode.window.showInputBox({
            prompt: "Enter Module name"
        })
            .then(findReadme);
    }
    else if (vscode.window.activeTextEditor &&
        vscode.window.activeTextEditor.document &&
        (
        // testMode bypasses these checks... *sigh*
        extension_1.TestHook.testMode ||
            vscode.window.activeTextEditor.document.languageId === 'javascript' ||
            vscode.window.activeTextEditor.document.languageId === 'typescript' ||
            vscode.window.activeTextEditor.document.languageId === 'javascriptreact' ||
            vscode.window.activeTextEditor.document.languageId === 'typescriptreact')) {
        findReadme(moduleName);
    }
}
exports.command = command;
function scanDocument(textEditor) {
    const textDocument = textEditor.document;
    let pos = textEditor.selection.start;
    let line = textDocument.lineAt(pos.line);
    let parsers = [require_1.requireParser, import_1.importParser];
    for (let i = 0; i < parsers.length; i++) {
        const moduleName = vscode_helper_1.vscodeHelper(line, pos, parsers[i]);
        if (moduleName)
            return moduleName;
    }
    return null;
}
function findReadme(moduleName, textEditor) {
    textEditor = textEditor || vscode.window.activeTextEditor;
    if (!textEditor.document) {
        throw new Error('No open document');
    }
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(textEditor.document.uri);
    let readmeLocation = vscode.Uri.parse(`https://npmjs.org/package/${moduleName}`);
    if (workspaceFolder) {
        const fsLocation = workspaceFolder.uri.with({ path: path.join(workspaceFolder.uri.fsPath, "node_modules", moduleName, "README.md") });
        if (fs.existsSync(fsLocation.fsPath)) {
            readmeLocation = fsLocation.with({
                scheme: 'file'
            });
        }
    }
    // see if we have an override for it
    const overrides = vscode.workspace.getConfiguration(type_extensions_1.overrideConfigurationSection);
    if (overrides[moduleName]) {
        // if we do, use that
        readmeLocation = vscode.Uri.parse(overrides[moduleName]);
    }
    // map schemes to our scheme types
    if (readmeLocation.scheme === 'file') {
        readmeLocation = readmeLocation.with({
            scheme: local_1.LocalProvider.SchemaType
        });
    }
    else if (readmeLocation.authority === 'npmjs.org') {
        readmeLocation = readmeLocation.with({
            scheme: npm_1.NpmProvider.SchemaType
        });
    }
    else {
        readmeLocation = readmeLocation.with({
            scheme: remote_1.RemoteProvider.SchemaType,
            fragment: `${readmeLocation.scheme}.${readmeLocation.fragment}`
        });
    }
    return vscode.commands.executeCommand('markdown.showPreviewToSide', type_extensions_1.ReadmeUri.from(readmeLocation, moduleName).toEncodedUri());
}
//# sourceMappingURL=showReadme.js.map