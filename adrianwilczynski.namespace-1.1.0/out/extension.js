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
const path = require("path");
function activate(context) {
    const namespaceCompletionProvider = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'csharp' }, {
        provideCompletionItems(document, position, token, context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (isScriptFile(document)) {
                    return;
                }
                const linePrefix = getLinePrefix(document, position);
                if (!isNamespaceDeclaration(linePrefix)) {
                    return;
                }
                const fileDir = path.dirname(document.fileName);
                const csprojInfo = findCsprojFile(fileDir);
                if (!csprojInfo) {
                    return;
                }
                let rootNamespace = yield getRootNamespaceFromElement(csprojInfo.fullPath);
                if (!rootNamespace) {
                    rootNamespace = getRootNamespaceFromFileName(csprojInfo.fileName);
                }
                const projectRootRelativePath = path.relative(csprojInfo.dir, fileDir);
                const namespace = getNamespace(rootNamespace, projectRootRelativePath);
                return getCompletions(namespace);
            });
        }
    });
    context.subscriptions.push(namespaceCompletionProvider);
}
exports.activate = activate;
function isScriptFile(document) {
    return document.fileName.endsWith('.csx');
}
function isNamespaceDeclaration(linePrefix) {
    return /^[ \t]*namespace[ \t]+\w*$/.test(linePrefix);
}
function getLinePrefix(document, position) {
    return document.lineAt(position).text.substr(0, position.character);
}
function findCsprojFile(fileDir) {
    let searchDir = fileDir;
    const root = path.parse(fileDir).root;
    let found = false;
    let hasParentDir = true;
    let csprojFileName;
    const csprojExt = '.csproj';
    while (!found && hasParentDir) {
        const files = fs.readdirSync(searchDir);
        found = files.some(f => f.endsWith(csprojExt));
        hasParentDir = searchDir !== root;
        if (found) {
            csprojFileName = files.find(f => f.endsWith(csprojExt));
        }
        else if (hasParentDir) {
            searchDir = path.join(searchDir, '..');
        }
    }
    if (!found || !csprojFileName) {
        return;
    }
    return { fileName: csprojFileName, dir: searchDir, fullPath: path.join(searchDir, csprojFileName) };
}
function getRootNamespaceFromElement(csprojPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const csproj = yield vscode.workspace.openTextDocument(csprojPath);
        const matches = csproj.getText().match(/<RootNamespace>([\w.]+)<\/RootNamespace>/);
        if (!matches) {
            return;
        }
        return matches[1];
    });
}
function getRootNamespaceFromFileName(csprojFileName) {
    return path.basename(csprojFileName, path.extname(csprojFileName));
}
function getNamespace(rootNamespace, projectRootRelativePath) {
    return path.join(rootNamespace, projectRootRelativePath)
        .replace(/[\/\\]/g, '.')
        .replace(/[^\w.]/g, '_')
        .replace(/[.]{2,}/g, '.')
        .replace(/^[.]+/, '')
        .replace(/[.]+$/, '')
        .split('.')
        .map(s => /^[0-9]/.test(s) ? '_' + s : s)
        .join('.');
}
function getCompletions(namespace) {
    const moduleCompletion = new vscode.CompletionItem(namespace, vscode.CompletionItemKind.Module);
    const snippetCompletion = new vscode.CompletionItem('namespace-fill', vscode.CompletionItemKind.Snippet);
    snippetCompletion.insertText = namespace;
    snippetCompletion.detail = namespace;
    return [moduleCompletion, snippetCompletion];
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map