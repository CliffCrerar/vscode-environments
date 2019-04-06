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
const codeActionsRequest_1 = require("../codeActionsRequest");
const const_1 = require("../const");
const executeTransformRequest_1 = require("../executeTransformRequest");
const smartSelectionRequest_1 = require("../smartSelectionRequest");
const codeModService_1 = require("./codeModService");
class ConnectionService {
    listen() {
        this._connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
        this._documents = new vscode_languageserver_1.TextDocuments();
        this._documents.listen(this._connection);
        this._connection.onInitialize((params) => {
            return {
                capabilities: {
                    textDocumentSync: this._documents.syncKind,
                    executeCommandProvider: {
                        commands: [const_1.commandIds.reloadCodeMods]
                    }
                }
            };
        });
        this._connection.onDidChangeConfiguration(change => {
            this._settings = change.settings.javascriptBooster;
            codeModService_1.default.reloadAllCodeMods();
        });
        this._connection.onRequest(codeActionsRequest_1.codeActionsRequestType, codeActionsRequest_1.codeActionsRequestHandler);
        this._connection.onRequest(executeTransformRequest_1.executeTransformRequestType, executeTransformRequest_1.executeTransformRequestHandler);
        this._connection.onRequest(smartSelectionRequest_1.extendSelectionRequestType, smartSelectionRequest_1.extendSelectionRequestHandler);
        this._connection.onRequest(smartSelectionRequest_1.shrinkSelectionRequestType, smartSelectionRequest_1.shrinkSelectionRequestHandler);
        this._connection.onExecuteCommand((params) => __awaiter(this, void 0, void 0, function* () {
            switch (params.command) {
                case const_1.commandIds.reloadCodeMods:
                    codeModService_1.default.reloadAllCodeMods();
                    break;
                default:
                    break;
            }
        }));
        this._connection.listen();
    }
    connection() {
        return this._connection;
    }
    getDocument(uri) {
        return this._documents.get(uri);
    }
    getSettings() {
        return this._settings;
    }
}
exports.default = new ConnectionService();
//# sourceMappingURL=connectionService.js.map