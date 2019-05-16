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
const vscode_languageserver_1 = require("vscode-languageserver");
const astService_1 = require("./services/astService");
const connectionService_1 = require("./services/connectionService");
const smartSelectionService_1 = require("./services/smartSelectionService");
exports.extendSelectionRequestType = new vscode_languageserver_1.RequestType('javascriptBooster/extendSelection');
exports.extendSelectionRequestHandler = (params) => __awaiter(this, void 0, void 0, function* () {
    const { textDocumentUri, selections } = params;
    let result = {
        selections: null
    };
    const document = connectionService_1.default.getDocument(textDocumentUri);
    if (!astService_1.default.isSupportedLanguage(document.languageId)) {
        return result;
    }
    const source = astService_1.default.normalizedText(document.getText());
    const ast = astService_1.default.getAstTree({
        languageId: document.languageId,
        fileName: document.uri,
        source
    });
    if (!ast) {
        return result;
    }
    result.selections = smartSelectionService_1.default
        .extendSelection({
        languageId: document.languageId,
        source,
        fileName: document.uri,
        ast,
        selections: selections.map(sel => ({
            anchor: astService_1.default.offsetAt(source, sel.anchor),
            active: astService_1.default.offsetAt(source, sel.active)
        }))
    })
        .map(sel => ({
        anchor: astService_1.default.positionAt(source, sel.anchor),
        active: astService_1.default.positionAt(source, sel.active)
    }));
    return result;
});
exports.shrinkSelectionRequestType = new vscode_languageserver_1.RequestType('javascriptBooster/shrinkSelection');
exports.shrinkSelectionRequestHandler = (params) => __awaiter(this, void 0, void 0, function* () {
    const { textDocumentUri, selections } = params;
    let result = {
        selections: null
    };
    const document = connectionService_1.default.getDocument(textDocumentUri);
    if (!astService_1.default.isSupportedLanguage(document.languageId)) {
        return result;
    }
    const source = astService_1.default.normalizedText(document.getText());
    const ast = astService_1.default.getAstTree({
        languageId: document.languageId,
        fileName: document.uri,
        source
    });
    if (!ast) {
        return result;
    }
    result.selections = smartSelectionService_1.default
        .shrinkSelection({
        languageId: document.languageId,
        source,
        fileName: document.uri,
        ast,
        selections: selections.map(sel => ({
            anchor: astService_1.default.offsetAt(source, sel.anchor),
            active: astService_1.default.offsetAt(source, sel.active)
        }))
    })
        .map(sel => ({
        anchor: astService_1.default.positionAt(source, sel.anchor),
        active: astService_1.default.positionAt(source, sel.active)
    }));
    return result;
});
//# sourceMappingURL=smartSelectionRequest.js.map