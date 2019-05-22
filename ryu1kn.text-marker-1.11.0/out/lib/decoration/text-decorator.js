"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TextDecorator {
    constructor(textLocationRegistry, decorationTypeRegistry) {
        this.textLocationRegistry = textLocationRegistry;
        this.decorationTypeRegistry = decorationTypeRegistry;
    }
    decorate(editors, decorations) {
        editors.forEach(visibleEditor => {
            decorations.forEach(decoration => {
                this.addDecoration(visibleEditor, decoration);
            });
        });
    }
    undecorate(editors, decorationIds) {
        decorationIds.forEach(decorationId => {
            this.decorationTypeRegistry.inquire(decorationId).map(dt => {
                editors.forEach(visibleEditor => {
                    visibleEditor.unsetDecorations(dt);
                });
            });
            this.decorationTypeRegistry.revoke(decorationId);
            this.textLocationRegistry.deregister(decorationId);
        });
    }
    redecorate(editors, decorations) {
        this.undecorate(editors, decorations.map(d => d.id));
        this.decorate(editors, decorations);
    }
    addDecoration(editor, decoration) {
        const ranges = decoration.pattern.locateIn(editor.wholeText);
        const decorationType = this.decorationTypeRegistry.provideFor(decoration);
        editor.setDecorations(decorationType, ranges);
        this.textLocationRegistry.register(editor.id, decoration.id, ranges);
    }
}
exports.default = TextDecorator;
//# sourceMappingURL=text-decorator.js.map