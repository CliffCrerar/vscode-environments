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
const debounce_1 = require("../utils/debounce");
class ActivityDiagnostics {
    constructor(store) {
        this.store = store;
        this.collection = vsc.languages.createDiagnosticCollection('activity-diagnostics');
    }
    dispose() {
        // tslint:disable: no-unused-expression
        this.collection && this.collection.dispose();
        this.handler && this.handler.dispose();
        // tslint:enable: no-unused-expression
    }
    register() {
        this.handler = vsc.workspace.onDidChangeTextDocument(debounce_1.default(this.documentChanged.bind(this), 250));
        if (vsc.window.activeTextEditor) {
            const isPlannerFile = vsc.window.activeTextEditor.document && vsc.window.activeTextEditor.document.languageId === constants_1.LanguageId;
            if (isPlannerFile) {
                this.refresh(vsc.window.activeTextEditor.document);
            }
        }
    }
    documentChanged(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const isPlannerFile = e.document && e.document.languageId === constants_1.LanguageId;
            if (!isPlannerFile) {
                return;
            }
            yield this.refresh(e.document);
        });
    }
    refresh(document) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.ensureHasActivityTypes();
            this.collection.clear();
            const activities = this.store.activityTypes || [];
            const lines = document.getText().split(constants_1.NewLineRegex);
            const diagnostics = [];
            for (let i = 0; i < lines.length; i++) {
                const match = /^(\w+):/.exec(lines[i]);
                if (match) {
                    const activity = match[1];
                    if (!activities.includes(activity)) {
                        const range = new vsc.Range(i, 0, i, activity.length);
                        const diagnostic = new vsc.Diagnostic(range, `${activity} is not a valid Activity`);
                        diagnostic.code = activity;
                        diagnostics.push(diagnostic);
                    }
                }
            }
            this.collection.set(document.uri, diagnostics);
        });
    }
}
exports.ActivityDiagnostics = ActivityDiagnostics;
//# sourceMappingURL=activityDiagnostics.js.map