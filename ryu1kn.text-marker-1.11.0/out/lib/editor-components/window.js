"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_editor_1 = require("../text-editor");
class WindowComponent {
    constructor(window) {
        this.window = window;
    }
    get visibleTextEditors() {
        return this.window.visibleTextEditors
            .map(editor => new text_editor_1.default(editor));
    }
    get activeTextEditor() {
        return new text_editor_1.default(this.window.activeTextEditor);
    }
    showInputBox(options) {
        return this.window.showInputBox(options);
    }
    showInformationMessage(message) {
        return this.window.showInformationMessage(message);
    }
    showQuickPick(selectItems, options) {
        return this.window.showQuickPick(selectItems, options);
    }
}
exports.default = WindowComponent;
//# sourceMappingURL=window.js.map