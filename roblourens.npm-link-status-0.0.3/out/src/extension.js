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
const path = require("path");
const linkedModules_1 = require("./linkedModules");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.commands.registerCommand('npm-link-status.showLinkedModules', showLinkedModules);
        yield checkForLinkedModules();
        setInterval(checkForLinkedModules, 10 * 1000);
    });
}
exports.activate = activate;
const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
item.text = 'npm $(link)';
item.tooltip = 'Linked NPM modules detected';
item.command = 'npm-link-status.showLinkedModules';
function showLinkedModules() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || !workspaceFolders.length)
            return;
        const linkedModulesP = Promise.all(workspaceFolders.map(rootFolder => {
            return getLinkedModuleItems(rootFolder.uri.fsPath, workspaceFolders.length > 1);
        })).then(linkedModules => {
            // Flatten
            return linkedModules.reduce((acc, modules) => acc.concat(modules), []);
        });
        vscode.window.showQuickPick(linkedModulesP, { placeHolder: 'Linked NPM modules' });
    });
}
function getLinkedModuleItems(rootPath, isMultiroot) {
    return __awaiter(this, void 0, void 0, function* () {
        const linkedModules = yield linkedModules_1.getLinkedModules(rootPath);
        return linkedModules.map(m => {
            const description = isMultiroot ?
                path.basename(rootPath) + ' → ' + m.actualPath :
                '→ ' + m.actualPath;
            return {
                label: m.name,
                description
            };
        });
    });
}
function checkForLinkedModules() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || !workspaceFolders.length)
            return;
        for (let rootFolder of workspaceFolders) {
            if (yield linkedModules_1.hasLinkedModules(rootFolder.uri.fsPath)) {
                item.show();
                return;
            }
        }
        item.hide();
    });
}
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map