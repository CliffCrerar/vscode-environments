"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_editor_1 = require("./text-editor");
class TextEditorFactory {
    constructor(createRange) {
        this.createRange = createRange;
    }
    create(editor) {
        return new text_editor_1.default(editor, this.createRange);
    }
}
exports.default = TextEditorFactory;
//# sourceMappingURL=text-editor-factory.js.map