"use strict";
const vsc = require("vscode");
const lst = require("vscode-languageserver-types");
class Snippet {
    constructor(content, cssLanguageService, character) {
        this._document = lst.TextDocument.create('', 'scss', 1, content);
        this._stylesheet = cssLanguageService.parseStylesheet(this._document);
        this._position = new vsc.Position(this._document.lineCount - 1, character ? character : 0);
    }
    get document() {
        return this._document;
    }
    get stylesheet() {
        return this._stylesheet;
    }
    get position() {
        return this._position;
    }
}
exports.Snippet = Snippet;
//# sourceMappingURL=snippet.js.map