"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decoration_operator_factory_1 = require("../decoration/decoration-operator-factory");
const pattern_factory_1 = require("../pattern/pattern-factory");
class ToggleHighlightCommand {
    constructor(matchingModeRegistry, textLocationRegistry, decorationRegistry, decorationTypeRegistry, windowComponent) {
        this.decorationOperatorFactory = new decoration_operator_factory_1.default(decorationRegistry, decorationTypeRegistry, textLocationRegistry, windowComponent);
        this.patternFactory = new pattern_factory_1.default(matchingModeRegistry);
        this.textLocationRegistry = textLocationRegistry;
    }
    execute(textEditor) {
        const decorationId = this.textLocationRegistry.queryDecorationId(textEditor.id, textEditor.selection).toUndefined();
        if (decorationId) {
            this.removeDecoration(decorationId);
        }
        else {
            this.addDecoration(textEditor);
        }
    }
    removeDecoration(decorationId) {
        const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
        decorationOperator.removeDecoration(decorationId);
    }
    addDecoration(textEditor) {
        if (!textEditor.selectedText)
            return;
        const pattern = this.patternFactory.create({ phrase: textEditor.selectedText });
        const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
        decorationOperator.addDecoration(pattern);
    }
}
exports.default = ToggleHighlightCommand;
//# sourceMappingURL=toggle-highlight.js.map