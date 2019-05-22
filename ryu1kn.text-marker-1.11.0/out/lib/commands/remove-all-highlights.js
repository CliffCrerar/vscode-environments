"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RemoveAllHighlightsCommand {
    constructor(decorationOperatorFactory) {
        this.decorationOperatorFactory = decorationOperatorFactory;
    }
    execute() {
        const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
        decorationOperator.removeAllDecorations();
    }
}
exports.default = RemoveAllHighlightsCommand;
//# sourceMappingURL=remove-all-highlights.js.map