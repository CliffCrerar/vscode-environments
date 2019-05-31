"use strict";
const vsc = require("vscode");
const lst = require("vscode-languageserver-types");
const css = require("vscode-css-languageservice");
const fs = require("fs");
const path = require("path");
const snippet_1 = require("./snippet");
class ClassServer {
    constructor(context) {
        this.context = context;
        this.cssLanguageService = css.getSCSSLanguageService();
        this.globalMap = {};
        this.localMap = {};
        this.dot = vsc.CompletionItemKind.Class;
        this.hash = vsc.CompletionItemKind.Reference;
        this.glob = '**/*.scss';
        this.globalStyleSheets = {};
        this.globalImports = {};
        this.regex = [
            /(class|id)=["|']([^"^']*$)/i,
            /(\.|\#)[^\.^\#^\<^\>]*$/i,
            /<style[\s\S]*>([\s\S]*)<\/style>/ig
        ];
        this.initialize();
    }
    provideCompletionItems(document, position, token) {
        let start = new vsc.Position(0, 0);
        let range = new vsc.Range(start, position);
        let text = document.getText(range);
        let tag = this.regex[0].exec(text);
        if (!tag) {
            tag = this.regex[1].exec(text);
        }
        if (tag) {
            let internal = new Array();
            let style;
            while (style = this.regex[2].exec(document.getText())) {
                let snippet = new snippet_1.Snippet(style[1], this.cssLanguageService);
                let symbols = this.cssLanguageService.findDocumentSymbols(snippet.document, snippet.stylesheet);
                for (let symbol of symbols) {
                    internal.push(symbol);
                }
            }
            this.pushSymbols('style', internal);
            let items = {};
            for (let key in this.globalMap) {
                for (let item of this.globalMap[key]) {
                    items[item.label] = item;
                }
            }
            for (let key in this.localMap) {
                for (let item of this.localMap[key]) {
                    items[item.label] = item;
                }
            }
            let id = tag[0].startsWith('id') || tag[0].startsWith('#');
            let ci = new Array();
            for (let item in items) {
                if ((id && items[item].kind === this.hash) || !id && items[item].kind === this.dot) {
                    ci.push(items[item]);
                }
            }
            return new vsc.CompletionList(ci);
        }
        return null;
    }
    resolveCompletionItem(item, token) {
        return null;
    }
    initialize() {
        if (vsc.workspace.rootPath) {
            this.getOptions();
        }
    }
    getOptions() {
        let optionsJson = path.resolve(vsc.workspace.rootPath, 'scss-options.json');
        fs.readFile(optionsJson, 'utf8', (err, data) => {
            if (err) {
                vsc.workspace.findFiles(this.glob, '').then((uris) => {
                    for (let i = 0; i < uris.length; i++) {
                        this.parse(uris[i], true);
                    }
                });
                this.setGlobalWatcher();
            }
            else {
                let optionsJson = JSON.parse(data);
                if (!optionsJson.options) {
                    console.log('no options found in json');
                    return;
                }
                this.options = optionsJson.options;
                this.getGlobalStyleSheets();
                if (this.options.isAngularProject) {
                    this.initializeAngularProject(this.context);
                }
            }
        });
    }
    pushSymbols(key, symbols, isGlobal = false) {
        let regex = /[\.\#]([\w-]+)/g;
        let ci = new Array();
        for (let i = 0; i < symbols.length; i++) {
            if (symbols[i].kind !== 5) {
                continue;
            }
            let symbol;
            while (symbol = regex.exec(symbols[i].name)) {
                let item = new vsc.CompletionItem(symbol[1]);
                item.kind = symbol[0].startsWith('.') ? this.dot : this.hash;
                item.detail = path.basename(key);
                ci.push(item);
            }
        }
        if (isGlobal) {
            this.globalMap[key] = ci;
        }
        else {
            this.localMap[key] = ci;
        }
    }
    parse(uri, isGlobal = false, callback) {
        fs.readFile(uri.fsPath, 'utf8', (err, data) => {
            if (err) {
                delete this.globalMap[uri.fsPath];
                if (callback) {
                    callback(false);
                }
            }
            else {
                let doc = lst.TextDocument.create(uri.fsPath, 'scss', 1, data);
                let parsedDoc = this.cssLanguageService.parseStylesheet(doc);
                this.findImports(doc, isGlobal);
                let symbols = this.cssLanguageService.findDocumentSymbols(doc, parsedDoc);
                this.pushSymbols(uri.fsPath, symbols, isGlobal);
                if (callback) {
                    callback(true);
                }
            }
        });
    }
    findImports(doc, isGlobal) {
        let imports = doc.getText().match(/@import '([^;]*)';/g);
        if (!imports) {
            return;
        }
        let currentDir = doc.uri.substring(0, doc.uri.lastIndexOf('\\'));
        imports.forEach(imp => {
            let relativePath = imp.match(/'(.*)'/).pop();
            this.parseImport(currentDir, relativePath, doc.uri, isGlobal);
            let _relativePath;
            if (relativePath.indexOf('/_') === -1) {
                _relativePath = [relativePath.slice(0, relativePath.lastIndexOf('/') + 1), '_', relativePath.slice(relativePath.lastIndexOf('/') + 1)].join('');
            }
            if (_relativePath) {
                this.parseImport(currentDir, _relativePath, doc.uri, isGlobal);
            }
        });
    }
    getLocalClasses(htmlUri) {
        // Clear local map
        this.localMap = {};
        let filePath = htmlUri.fsPath.replace(/\.[^/.]+$/, '');
        filePath += '.scss';
        let scssUri = vsc.Uri.file(filePath);
        this.parse(scssUri);
    }
    getGlobalStyleSheets() {
        if (this.options.globalStyles.length === 0) {
            return;
        }
        for (let styleSheetPath of this.options.globalStyles) {
            let uri = vsc.Uri.file(path.resolve(vsc.workspace.rootPath, styleSheetPath));
            this.globalStyleSheets[uri.fsPath] = [];
            this.parse(uri, true);
        }
        this.setGlobalWatcher();
    }
    setGlobalWatcher() {
        let watcher = vsc.workspace.createFileSystemWatcher(this.glob);
        watcher.onDidCreate(uri => {
            if (Object.keys(this.globalStyleSheets).length === 0 || this.globalStyleSheets[uri.fsPath] || this.globalImports[uri.fsPath]) {
                this.parse(uri, true);
            }
        });
        watcher.onDidChange(uri => {
            if (Object.keys(this.globalStyleSheets).length === 0 || this.globalStyleSheets[uri.fsPath] || this.globalImports[uri.fsPath]) {
                this.parse(uri, true);
            }
        });
        watcher.onDidDelete(uri => {
            delete this.globalMap[uri.fsPath];
        });
        this.context.subscriptions.push(watcher);
    }
    initializeAngularProject(context) {
        let currentDocument = vsc.window.activeTextEditor.document;
        if (currentDocument.languageId === 'html') {
            this.getLocalClasses(currentDocument.uri);
        }
        this.setFileOpenListener();
    }
    setFileOpenListener() {
        let fileOpenListener = vsc.workspace.onDidOpenTextDocument(document => {
            let fileExtension = document.fileName.split('.').pop();
            if (fileExtension === 'html') {
                this.getLocalClasses(document.uri);
            }
        });
        this.context.subscriptions.push(fileOpenListener);
    }
    parseImport(currentDir, relativePath, parent, isGlobal) {
        let filePath = path.resolve(currentDir, relativePath + '.scss');
        let uri = vsc.Uri.file(filePath);
        this.parse(uri, isGlobal, succes => {
            if (succes && isGlobal) {
                let existingImport = this.globalImports[uri.fsPath];
                if (!existingImport) {
                    this.globalImports[uri.fsPath] = parent;
                }
                let parentSheetImports = this.globalStyleSheets[parent];
                if (parentSheetImports) {
                    parentSheetImports.push(uri.fsPath);
                }
                else {
                }
            }
        });
    }
}
exports.ClassServer = ClassServer;
//# sourceMappingURL=class-server.js.map