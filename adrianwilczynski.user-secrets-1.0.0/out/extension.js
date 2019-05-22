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
const csproj_1 = require("./csproj");
const prompt_1 = require("./prompt");
const secretsJson_1 = require("./secretsJson");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.manageUserSecrets', manageUserSecrets));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function manageUserSecrets(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const csprojUri = uri || getOpenCsprojUri();
        if (!csprojUri) {
            return;
        }
        const csproj = yield vscode.workspace.openTextDocument(csprojUri);
        const element = csproj_1.getUserSecretsIdElement(csproj);
        let id;
        if (element) {
            id = csproj_1.getIdFromElement(element);
            if (!id) {
                vscode.window.showWarningMessage("There is a UserSecretsId element in this .csproj file but it doesn't seem to contain a valid identifier.");
                return;
            }
        }
        else if (yield prompt_1.shouldGenerate()) {
            const position = csproj_1.getPropertyGroupClosingTagLinePosition(csproj);
            if (!position) {
                vscode.window.showWarningMessage('Unable to find a PropertyGroup element in this .csproj file.');
                return;
            }
            id = yield csproj_1.insertUserSecretsIdElement(position, csproj);
        }
        else {
            return;
        }
        const secretsPath = secretsJson_1.getSecretsPath(id);
        if (!secretsPath) {
            vscode.window.showWarningMessage('Unable to determine secrets.json file location.');
            return;
        }
        yield secretsJson_1.ensureSecretsExist(secretsPath);
        const secretsJson = yield vscode.workspace.openTextDocument(secretsPath);
        yield vscode.window.showTextDocument(secretsJson);
    });
}
function getOpenCsprojUri() {
    if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document.fileName.endsWith('.csproj')) {
        return;
    }
    return vscode.window.activeTextEditor.document.uri;
}
//# sourceMappingURL=extension.js.map