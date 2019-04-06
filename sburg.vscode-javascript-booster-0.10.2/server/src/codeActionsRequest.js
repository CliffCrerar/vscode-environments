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
exports.codeActionsRequestType = new vscode_languageserver_1.RequestType('javascriptBooster/codeActions');
exports.codeActionsRequestHandler = (params) => __awaiter(this, void 0, void 0, function* () {
    let result;
    const document = connectionService_1.default.getDocument(params.textDocumentUri);
    const source = document.getText();
    const codeMods = yield codeModService_1.default.getCodeActionMods({
        languageId: document.languageId,
        fileName: document.uri,
        source,
        selection: {
            anchor: astService_1.default.offsetAt(source, params.selection.anchor),
            active: astService_1.default.offsetAt(source, params.selection.active)
        }
    });
    result = {
        textDocument: {
            uri: document.uri,
            version: document.version
        },
        codeMods: codeMods.map(mod => ({
            id: mod.id,
            title: mod.name,
            tooltip: mod.detail || mod.description
        }))
    };
    return result;
});
//# sourceMappingURL=codeActionsRequest.js.map