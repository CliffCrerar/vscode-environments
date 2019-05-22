"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decoration_operator_factory_1 = require("../decoration/decoration-operator-factory");
const pattern_factory_1 = require("../pattern/pattern-factory");
class GoToHighlightCommand {
    constructor(matchingModeRegistry, textLocationRegistry, decorationRegistry, decorationTypeRegistry, windowComponent) {
        this.decorationOperatorFactory = new decoration_operator_factory_1.default(decorationRegistry, decorationTypeRegistry, textLocationRegistry, windowComponent);
        this.textLocationRegistry = textLocationRegistry;
        this.patternFactory = new pattern_factory_1.default(matchingModeRegistry);
    }
    execute(editor) {
        const decorationId = this.textLocationRegistry.queryDecorationId(editor.id, editor.selection).toUndefined();
        if (!decorationId)
            this.addDecoration(editor);
        this.findTargetLocation(editor).map(range => { editor.selection = range; });
    }
    addDecoration(textEditor) {
        if (!textEditor.selectedText)
            return;
        const pattern = this.patternFactory.create({ phrase: textEditor.selectedText });
        const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
        decorationOperator.addDecoration(pattern);
    }
}
exports.GoToHighlightCommand = GoToHighlightCommand;
//# sourceMappingURL=go-to-highlight.js.map