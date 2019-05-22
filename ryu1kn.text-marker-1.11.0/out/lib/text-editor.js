"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const selected_text_finder_1 = require("./selected-text-finder");
const vscode_1 = require("vscode");
class TextEditor {
    constructor(editor) {
        this.editor = editor;
        this.selectedTextFinder = new selected_text_finder_1.default();
    }
    get id() {
        return this.editor.document.uri.toString();
    }
    get selectedText() {
        return this.selectedTextFinder.find(this.editor);
    }
    get wholeText() {
        return this.editor.document.getText();
    }
    get selection() {
        const selection = this.editor.selection;
        return {
            start: this.getFlatPosition(selection.start),
            end: this.getFlatPosition(selection.end)
        };
    }
    getFlatPosition(position) {
        return this.editor.document.offsetAt(position);
    }
    set selection(range) {
        this.editor.revealRange(this.getRange(range), vscode_1.TextEditorRevealType.InCenterIfOutsideViewport);
        this.editor.selection = this.getSelection(range);
    }
    getSelection(range) {
        return new vscode_1.Selection(this.getPosition(range.start), this.getPosition(range.end));
    }
    getRange(range) {
        return new vscode_1.Range(this.getPosition(range.start), this.getPosition(range.end));
    }
    getPosition(position) {
        return this.editor.document.positionAt(position);
    }
    setDecorations(decorationType, ranges) {
        const vsRanges = ranges.map(range => this.getRange(range));
        this.editor.setDecorations(decorationType, vsRanges);
    }
    unsetDecorations(decorationType) {
        this.editor.setDecorations(decorationType, []);
    }
}
exports.default = TextEditor;
//# sourceMappingURL=text-editor.js.map