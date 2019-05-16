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
const codeModService_1 = require("./services/codeModService");
const connectionService_1 = require("./services/connectionService");
const logService_1 = require("./services/logService");
const getTextEdit_1 = require("./utils/getTextEdit");
exports.executeTransformRequestType = new vscode_languageserver_1.RequestType('javascriptBooster/executeTransform');
exports.executeTransformRequestHandler = (params) => __awaiter(this, void 0, void 0, function* () {
    const { selection, codeModId, textDocumentIdentifier } = params;
    let result = {
        edit: null,
        selection: null
    };
    const document = connectionService_1.default.getDocument(textDocumentIdentifier.uri);
    if (!astService_1.default.isSupportedLanguage(document.languageId)) {
        return result;
    }
    const source = document.getText();
    const offsetSelection = {
        anchor: astService_1.default.offsetAt(source, selection.anchor),
        active: astService_1.default.offsetAt(source, selection.active)
    };
    let transformResult;
    try {
        transformResult = codeModService_1.default.executeTransform(codeModId, {
            languageId: document.languageId,
            fileName: document.uri,
            source,
            selection: offsetSelection
        });
    }
    catch (e) {
        logService_1.default.outputError(`Error while executing ${codeModId}.transform(): ${e.toString()}`);
        return result;
    }
    if (transformResult.source === source) {
        return result;
    }
    const { range, newText } = getTextEdit_1.default(source, transformResult.source);
    result.edit = {
        range: {
            start: document.positionAt(range.start),
            end: document.positionAt(range.end)
        },
        newText
    };
    if (transformResult.selection) {
        result.selection = {
            active: astService_1.default.positionAt(transformResult.source, transformResult.selection.active),
            anchor: astService_1.default.positionAt(transformResult.source, transformResult.selection.anchor)
        };
    }
    return result;
});
//# sourceMappingURL=executeTransformRequest.js.map