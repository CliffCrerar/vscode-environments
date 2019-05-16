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
const const_1 = require("./const");
const langService_1 = require("./services/langService");
const isSelection_1 = require("./utils/isSelection");
class CodeModCodeActionProvider {
    provideCodeActions(document, selection, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!const_1.isSupportedLanguage(document.languageId)) {
                return [];
            }
            if (!isSelection_1.isSelection(selection)) {
                // Complex commands, run-on-save etc
                return [];
            }
            const result = yield langService_1.default.requestCodeActions(document.uri.toString(), selection);
            return result.codeMods.map(mod => ({
                title: mod.title,
                tooltip: mod.tooltip,
                command: const_1.commandIds._executeCodeAction,
                arguments: [mod.id, result.textDocument, selection]
            }));
        });
    }
}
exports.CodeModCodeActionProvider = CodeModCodeActionProvider;
//# sourceMappingURL=CodeModCodeActionProvider.js.map