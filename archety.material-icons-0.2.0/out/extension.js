"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const library_1 = require("./library");
let library;
function activate(context) {
    console.log("We are up and running!");
    library = new library_1.Library(context.extensionPath);
    let commands = [
        vscode.commands.registerCommand('materialIcons.showLibrary', library.show.bind(library)),
        vscode.commands.registerCommand('materialIcons.updateLibrary', library.update.bind(library)),
        vscode.commands.registerCommand('materialIcons.insertIcon', library.insertIcon.bind(library)),
        vscode.commands.registerCommand('materialIcons.dispatchEvent', library.dispatchEvent.bind(library))
    ];
    vscode.window.onDidChangeActiveTextEditor(library.setAcitveTextEditor.bind(library));
    context.subscriptions.push(...commands);
}
exports.activate = activate;
function deactivate() {
    library.deconstructor();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map