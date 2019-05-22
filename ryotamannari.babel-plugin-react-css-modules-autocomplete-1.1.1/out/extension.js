'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const SCHEMES = [
    { language: 'typescriptreact', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'javascript', scheme: 'file' }
];
const QUOTES = ['"', "'", '`'];
function getImportPaths(source) {
    const reg = /(import\s+|from\s+|require\(\s*)["'](.*?\.(s|pc|sc|c)ss)["']/g;
    let matched;
    const paths = [];
    while ((matched = reg.exec(source))) {
        paths.push({
            path: matched[2],
            position: matched.index
        });
    }
    return paths;
}
exports.getImportPaths = getImportPaths;
function getAllStyleName(css) {
    const reg = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9\-]*)([\w/:%#\$&\?\(\)~\.=\+\-]*[\s"']*?\))?/g;
    let matched;
    const results = [];
    const styleNames = [];
    while ((matched = reg.exec(css))) {
        const styleName = matched[1];
        if (matched[2] || styleNames.indexOf(styleName) !== -1)
            continue;
        styleNames.push(styleName);
        results.push({
            styleName,
            position: matched.index
        });
    }
    return results;
}
exports.getAllStyleName = getAllStyleName;
function isStyleNameValue(target) {
    const propNamePosition = target.lastIndexOf('=');
    if (propNamePosition === -1)
        return false;
    return target.substr(propNamePosition - 9, 9) === 'styleName';
}
exports.isStyleNameValue = isStyleNameValue;
function getNearestBeginningQuote(target) {
    const result = QUOTES.map(quote => ({
        position: target.lastIndexOf(quote),
        quote
    })).sort((a, b) => (a.position < b.position ? 1 : -1))[0];
    if (result.position === -1)
        return null;
    return result.quote;
}
exports.getNearestBeginningQuote = getNearestBeginningQuote;
function getStyleNameAtPoint(target, point) {
    const reg = /-?[_a-zA-Z]+[_a-zA-Z0-9\-]*/g;
    let matched;
    while ((matched = reg.exec(target))) {
        const styleName = matched[0];
        if (matched.index <= point && point <= matched.index + styleName.length) {
            return styleName;
        }
    }
    return null;
}
exports.getStyleNameAtPoint = getStyleNameAtPoint;
function isInsideString(target, char) {
    const propValuePosition = target.lastIndexOf('=');
    if (propValuePosition === -1)
        return false;
    const test = target.substr(propValuePosition);
    const quote = char || getNearestBeginningQuote(test);
    if (!quote)
        return false;
    const hits = test.split(quote).length;
    return hits >= 2 && hits % 2 === 0;
}
exports.isInsideString = isInsideString;
function findPosition(haystack, needle) {
    let index = haystack.indexOf(needle);
    if (index === -1)
        return new vscode.Position(0, 0);
    let line = 0;
    while (index > 0) {
        const lineBreak = haystack.indexOf('\n') + 1;
        if (lineBreak === 0)
            break;
        haystack = haystack.substr(lineBreak);
        if (index < lineBreak) {
            break;
        }
        else {
            index -= lineBreak;
            line++;
        }
    }
    return new vscode.Position(line, index);
}
exports.findPosition = findPosition;
function getDefinitionsAsync(document) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.all(getImportPaths(document.getText()).map(importPath => new Promise(resolve => {
            const fullpath = path.resolve(path.dirname(document.uri.fsPath), importPath.path);
            const openedTextDocument = vscode.workspace.textDocuments.find(document => document.uri.fsPath === fullpath);
            const source = openedTextDocument ? openedTextDocument.getText() : fs.readFileSync(fullpath).toString('utf8');
            resolve(getAllStyleName(source).map(({ styleName, position }) => ({
                path: fullpath,
                styleName,
                position
            })));
        }).catch(() => []))).then(pathResults => pathResults.reduce((acc, results) => [...acc, ...results], []));
    });
}
exports.getDefinitionsAsync = getDefinitionsAsync;
function provideCompletionItemsAsync(document, position) {
    return __awaiter(this, void 0, void 0, function* () {
        const line = document.getText(document.lineAt(position).range);
        const cursorChar = line[position.character - 1];
        if (cursorChar !== '"' && cursorChar !== "'" && cursorChar !== '`' && cursorChar !== ' ')
            return [];
        const target = line.substr(0, position.character);
        if (!isStyleNameValue(target) || !isInsideString(target))
            return [];
        const definitions = yield getDefinitionsAsync(document);
        return definitions.map(def => new vscode_1.CompletionItem(def.styleName, vscode.CompletionItemKind.Variable));
    });
}
exports.provideCompletionItemsAsync = provideCompletionItemsAsync;
function provideDefinition(document, position, _) {
    return __awaiter(this, void 0, void 0, function* () {
        const line = document.getText(document.lineAt(position).range);
        const target = line.substr(0, position.character);
        if (!isStyleNameValue(target))
            return null;
        const styleName = getStyleNameAtPoint(line, position.character);
        const definitions = yield getDefinitionsAsync(document);
        const definition = definitions.find(def => def.styleName === styleName);
        if (!definition)
            return null;
        return new Promise(resolve => fs.readFile(definition.path, (err, data) => resolve(err
            ? null
            : new vscode.Location(vscode.Uri.file(definition.path), findPosition(data.toString('utf8'), `.${definition.styleName}`)))));
    });
}
function activate(context) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(SCHEMES, {
        provideCompletionItems: provideCompletionItemsAsync
    }, '"', "'", '`', ' '));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(SCHEMES, {
        provideDefinition
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map