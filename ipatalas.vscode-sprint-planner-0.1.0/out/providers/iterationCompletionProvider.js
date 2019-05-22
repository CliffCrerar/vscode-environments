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
const vsc = require("vscode");
const constants_1 = require("../constants");
const document_1 = require("../utils/document");
class IterationCompletionProvider {
    constructor(sessionStore, logger) {
        this.sessionStore = sessionStore;
        this.logger = logger;
    }
    provideCompletionItems(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = document_1.Document.getTextBeforeCursor(document, position);
            if (text === constants_1.IterationPrefix) {
                try {
                    yield this.sessionStore.ensureHasIterations();
                    if (this.sessionStore.iterations) {
                        return this.sessionStore.iterations.map(it => {
                            const item = new vsc.CompletionItem(`${it.name} - (${it.path})`, vsc.CompletionItemKind.Class);
                            item.insertText = `${it.id} - ${it.name} - (${it.path})`;
                            item.sortText = it.path;
                            return item;
                        });
                    }
                }
                catch (err) {
                    if (err) {
                        vsc.window.showErrorMessage(err.message);
                        this.logger.log(err);
                    }
                }
            }
            return [];
        });
    }
}
exports.IterationCompletionProvider = IterationCompletionProvider;
//# sourceMappingURL=iterationCompletionProvider.js.map