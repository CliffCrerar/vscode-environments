"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const vscode = require("vscode");
const css = require("vscode-css-languageservice");
class StylesheetManager {
    constructor() {
        this.cssLanguageService = css.getSCSSLanguageService();
        this.globalStyleSheets = {};
        this.globalImports = {};
        this.globalMap = {};
        this.localMap = {};
    }
    findInMapFirstOrDefault(map, property) {
        let styleSheetPath = null;
        for (let key in map) {
            let found;
            for (let item of map[key]) {
                if (item.label === property) {
                    styleSheetPath = key;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        return styleSheetPath;
    }
    findInMap(map, property) {
        let styleSheetPaths = new Array();
        for (let key in map) {
            for (let item of map[key]) {
                if (item.label === property) {
                    styleSheetPaths.push(key);
                }
            }
        }
        return styleSheetPaths;
    }
    compareSplit(split, compareTo) {
        let isEqual = false;
        for (let i = 0; i < split.length; i++) {
            if (split[i] === compareTo) {
                isEqual = true;
                break;
            }
        }
        return isEqual;
    }
    findLocation(property, uri) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield vscode.workspace.openTextDocument(uri);
            return this.findLocationInSheet(doc, property, uri);
        });
    }
    findLocationInSheet(doc, property, uri) {
        let parsedDoc = this.cssLanguageService.parseStylesheet(doc);
        let symbols = this.cssLanguageService.findDocumentSymbols(doc, parsedDoc);
        let locationFound = false;
        let location;
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            if (symbol.name.charAt(0) === '.' || symbol.name.charAt(0) === '#') {
                if (symbol.name.substring(1) === property) {
                    locationFound = true;
                }
                else {
                    let split = symbol.name.split(/[ ]+/);
                    for (let i = 0; i < split.length; i++) {
                        if (split[i].substring(1) === property) {
                            locationFound = true;
                            break;
                        }
                    }
                }
            }
            else {
                let splitPoint = symbol.name.split('.');
                locationFound = this.compareSplit(splitPoint, property);
                if (!locationFound) {
                    let splitHash = symbol.name.split('#');
                    locationFound = this.compareSplit(splitHash, property);
                }
            }
            if (locationFound) {
                location = this.getLocation(uri, symbol.location.range.start.line, symbol.location.range.start.character);
                break;
            }
        }
        return location;
    }
    getLocation(uri, startLine, startCharacter) {
        let position = new vscode.Position(startLine, startCharacter);
        return new vscode.Location(uri, position);
    }
}
exports.StylesheetManager = StylesheetManager;
//# sourceMappingURL=stylesheet.manager.js.map