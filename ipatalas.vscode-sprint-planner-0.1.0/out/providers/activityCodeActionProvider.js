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
const didyoumean2_1 = require("didyoumean2");
class ActivityCodeActionProvider {
    constructor(store, logger) {
        this.store = store;
        this.logger = logger;
    }
    provideCodeActions(document, range, context, _token) {
        const diag = context.diagnostics.find(d => d.range.contains(range));
        if (diag) {
            return this.getCodeActions(document, diag);
        }
        return [];
    }
    getCodeActions(document, diag) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.ensureHasActivityTypes();
            const result = didyoumean2_1.default(diag.code, this.store.activityTypes || []);
            if (result) {
                const rangeToReplace = diag.range;
                const edit = new vsc.WorkspaceEdit();
                edit.replace(document.uri, rangeToReplace, result);
                const action = new vsc.CodeAction(`Did you mean '${result}'?`, vsc.CodeActionKind.QuickFix);
                action.diagnostics = [diag];
                action.edit = edit;
                return [action];
            }
            return [];
        });
    }
}
exports.ActivityCodeActionProvider = ActivityCodeActionProvider;
//# sourceMappingURL=activityCodeActionProvider.js.map