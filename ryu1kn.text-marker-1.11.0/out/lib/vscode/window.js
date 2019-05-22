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
const text_editor_1 = require("./text-editor");
const Option_1 = require("fp-ts/lib/Option");
class WindowComponent {
    constructor(window) {
        this.window = window;
    }
    get visibleTextEditors() {
        return this.window.visibleTextEditors
            .map(editor => new text_editor_1.default(editor));
    }
    get activeTextEditor() {
        const editor = this.window.activeTextEditor;
        return editor && new text_editor_1.default(editor);
    }
    showInputBox(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const userInput = yield this.window.showInputBox(options);
            return Option_1.fromPredicate((s) => !!s)(userInput);
        });
    }
    showInformationMessage(message) {
        return this.window.showInformationMessage(message);
    }
    showQuickPick(selectItems, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = this.fillDescription(selectItems);
            const result = yield this.window.showQuickPick(items, options);
            return Option_1.fromNullable(result);
        });
    }
    createTextEditorDecorationType(options) {
        return this.window.createTextEditorDecorationType(options);
    }
    fillDescription(selectItems) {
        return selectItems.map(item => Object.assign({}, item, { description: item.description || '' }));
    }
}
exports.default = WindowComponent;
//# sourceMappingURL=window.js.map