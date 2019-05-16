"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const configuration_1 = require("./configuration");
const tree_1 = require("./tree");
const hover_1 = require("./hover");
const completion_1 = require("./completion");
const lint_1 = require("./lint");
const preview_1 = require("./preview");
const util_1 = require("./util");
function activate(context) {
    const treeDataProvider = new tree_1.IconTreeDataProvider();
    const treeView = vscode.window.createTreeView("materialDesignIconsExplorer", {
        treeDataProvider
    });
    treeView.onDidChangeVisibility(event => {
        if (event.visible) {
            treeDataProvider.refresh();
        }
    });
    vscode.commands.registerCommand("materialdesigniconsIntellisense.openIconPreview", (node) => preview_1.showPreview(node, context));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.showMdiVersion", () => {
        fs.readFile(configuration_1.config.mdiPackagePath, (err, data) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
                return;
            }
            vscode.window.showInformationMessage("materialdesignicons-intellisense uses @mdi/svg@" +
                JSON.parse(data.toString("utf8"))["version"]);
        });
    }));
    vscode.commands.registerCommand("materialdesigniconsIntellisense.insertIconInActiveEditor", (node) => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            if (node.type === "icon") {
                editor.insertSnippet(new vscode.SnippetString(`${configuration_1.config.prefix}${util_1.createCompletion(node.doc.name)}${configuration_1.config.suffix}`));
            }
        }
        else {
            vscode.window.showInformationMessage(`No active editor`);
        }
    });
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.closeSearch", () => __awaiter(this, void 0, void 0, function* () {
        configuration_1.config.lastSearch = "";
        treeDataProvider.refresh();
        treeView.reveal({
            type: "other",
            label: "Search results"
        }, {
            expand: true,
            focus: true
        });
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.showIconSearch", () => __awaiter(this, void 0, void 0, function* () {
        const search = (yield vscode.window.showInputBox({
            value: configuration_1.config.lastSearch,
            prompt: "Search icons",
            placeHolder: "Search icons"
        })) || "";
        vscode.commands.executeCommand("materialdesigniconsIntellisense.performIconSearch", search);
    })));
    context.subscriptions.push(vscode.commands.registerCommand("materialdesigniconsIntellisense.performIconSearch", search => {
        configuration_1.config.lastSearch = search;
        treeDataProvider.refresh();
        treeView.reveal({
            type: "other",
            label: "Search results"
        }, {
            expand: true,
            focus: true
        });
    }));
    context.subscriptions.push(vscode.languages.registerHoverProvider(configuration_1.config.selector, new hover_1.HoverProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(configuration_1.config.selector, new completion_1.CompletionProvider(), "-", "i", ":"));
    const linter = new lint_1.IconLint();
    if (vscode.window.activeTextEditor) {
        linter.lintDocument(vscode.window.activeTextEditor.document);
    }
    vscode.workspace.onDidOpenTextDocument(linter.lintDocument, null, context.subscriptions);
    vscode.workspace.onDidCloseTextDocument(linter.deleteDiagnostics, null, context.subscriptions);
    vscode.workspace.onDidSaveTextDocument(linter.lintDocument, null, context.subscriptions);
    vscode.languages.registerCodeActionsProvider(configuration_1.config.selector, linter);
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration("materialdesigniconsIntellisense.selector")) {
            vscode.window.showInformationMessage("materialdesigniconsIntellisense.selector change takes affect after the next restart of code");
        }
        if (event.affectsConfiguration("materialdesigniconsIntellisense.overrideFontPackagePath")) {
            treeDataProvider.refresh();
        }
    }));
    console.log('"materialdesignicons-intellisense" is now active');
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map