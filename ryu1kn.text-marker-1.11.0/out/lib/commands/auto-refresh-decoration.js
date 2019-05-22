"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AutoRefreshDecoration {
    constructor(decorationOperatorFactory) {
        this.decorationOperatorFactory = decorationOperatorFactory;
    }
    execute(editor) {
        if (!editor)
            return;
        const decorationOperator = this.decorationOperatorFactory.create([editor]);
        decorationOperator.refreshDecorations();
    }
}
exports.default = AutoRefreshDecoration;
//# sourceMappingURL=auto-refresh-decoration.js.map