"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SelectedTextFinder {
    find(editor) {
        const selectedText = this.getSelectedText(editor);
        return selectedText ? selectedText : this.getWordUnderCursor(editor);
    }
    getSelectedText(editor) {
        return editor.document.getText(editor.selection);
    }
    getWordUnderCursor(editor) {
        const wordRange = editor.document.getWordRangeAtPosition(editor.selection.active);
        return wordRange && editor.document.getText(wordRange);
    }
}
exports.default = SelectedTextFinder;
//# sourceMappingURL=selected-text-finder.js.map