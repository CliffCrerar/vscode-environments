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
const path = require("path");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const const_1 = require("../const");
exports.codeActionsRequestType = new vscode_languageclient_1.RequestType('javascriptBooster/codeActions');
exports.executeTransformRequestType = new vscode_languageclient_1.RequestType('javascriptBooster/executeTransform');
exports.extendSelectionRequestType = new vscode_languageclient_1.RequestType('javascriptBooster/extendSelection');
exports.shrinkSelectionRequestType = new vscode_languageclient_1.RequestType('javascriptBooster/shrinkSelection');
class LangService {
    initialize() {
        if (this._languageClient) {
            // Already initialized
            return;
        }
        const base = path.join(__dirname, '..', '..', '..');
        let serverModule = path.normalize(path.join(base, 'server', 'src', 'server.js'));
        let serverOptions = {
            run: {
                module: serverModule,
                transport: vscode_languageclient_1.TransportKind.ipc,
                options: { cwd: process.cwd() }
            },
            debug: {
                module: serverModule,
                transport: vscode_languageclient_1.TransportKind.ipc,
                options: { execArgv: ['--nolazy', '--inspect=6014'], cwd: process.cwd() }
            }
        };
        let clientOptions = {
            documentSelector: const_1.supportedLanguages.map(language => ({ language })),
            synchronize: {
                configurationSection: const_1.extensionId
            }
        };
        this._languageClient = new vscode_languageclient_1.LanguageClient(const_1.extensionId, 'JavaScript Booster', serverOptions, clientOptions);
    }
    start() {
        return this._languageClient.start();
    }
    ready() {
        return this._languageClient.onReady();
    }
    requestCodeActions(textDocumentUri, selection) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._languageClient.sendRequest(exports.codeActionsRequestType, {
                textDocumentUri,
                selection
            });
            return result;
        });
    }
    executeTransform(codeModId, textDocumentIdentifier, selection) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._languageClient.sendRequest(exports.executeTransformRequestType, {
                codeModId,
                textDocumentIdentifier,
                selection
            });
            if (result.selection) {
                result.selection = this._rebuildSelection(result.selection);
            }
            return result;
        });
    }
    extendSelection(textDocumentUri, selections) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._languageClient.sendRequest(exports.extendSelectionRequestType, {
                textDocumentUri,
                selections
            });
            if (!result.selections) {
                return null;
            }
            return result.selections.map(sel => this._rebuildSelection(sel));
        });
    }
    shrinkSelection(textDocumentUri, selections) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._languageClient.sendRequest(exports.shrinkSelectionRequestType, {
                textDocumentUri,
                selections
            });
            if (!result.selections) {
                return null;
            }
            return result.selections.map(sel => this._rebuildSelection(sel));
        });
    }
    _rebuildSelection(sel) {
        return new vscode.Selection(new vscode.Position(sel.anchor.line, sel.anchor.character), new vscode.Position(sel.active.line, sel.active.character));
    }
}
exports.default = new LangService();
//# sourceMappingURL=langService.js.map