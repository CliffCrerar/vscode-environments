"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DecorationOperator {
    constructor(editors, decorationRegistry, textDecorator) {
        this.editors = editors;
        this.decorationRegistry = decorationRegistry;
        this.textDecorator = textDecorator;
    }
    addDecoration(pattern, colour) {
        this.decorationRegistry.issue(pattern, colour).map(decoration => {
            this.textDecorator.decorate(this.editors, [decoration]);
        });
    }
    removeDecoration(decorationId) {
        const decoration = this.decorationRegistry.inquireById(decorationId);
        decoration.map(d => this._removeDecoration(d));
    }
    _removeDecoration(decoration) {
        this.decorationRegistry.revoke(decoration.id);
        this.textDecorator.undecorate(this.editors, [decoration.id]);
    }
    updateDecoration(oldDecoration, newDecoration) {
        this.decorationRegistry.update(oldDecoration, newDecoration);
        this.textDecorator.redecorate(this.editors, [newDecoration]);
    }
    removeAllDecorations() {
        const decorations = this.decorationRegistry.retrieveAll();
        const decorationIds = decorations.map(d => d.id);
        decorationIds.forEach(decorationId => {
            this.decorationRegistry.revoke(decorationId);
        });
        this.textDecorator.undecorate(this.editors, decorationIds);
    }
    refreshDecorations() {
        const decorations = this.decorationRegistry.retrieveAll();
        this.textDecorator.decorate(this.editors, decorations);
    }
}
exports.default = DecorationOperator;
//# sourceMappingURL=decoration-operator.js.map