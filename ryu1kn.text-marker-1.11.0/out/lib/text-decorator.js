"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TextDecorator {
    constructor(textLocationRegistry) {
        this.textLocationRegistry = textLocationRegistry;
    }
    decorate(editors, decorations) {
        editors.forEach(visibleEditor => {
            decorations.forEach(decoration => {
                if (decoration.decorationType) {
                    this.addDecoration(visibleEditor, decoration);
                }
            });
        });
    }
    undecorate(editors, decorations) {
        decorations.forEach(decoration => {
            editors.forEach(visibleEditor => {
                visibleEditor.unsetDecorations(decoration.decorationType);
            });
            this.textLocationRegistry.deregister(decoration.id);
        });
    }
    addDecoration(editor, decoration) {
        const ranges = decoration.pattern.locateIn(editor.wholeText);
        editor.setDecorations(decoration.decorationType, ranges);
        this.textLocationRegistry.register(editor.id, decoration.id, ranges);
    }
}
exports.default = TextDecorator;
//# sourceMappingURL=text-decorator.js.map