"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AutoRefreshDecorationWithDelay {
    constructor(decorationOperatorFactory, debouncer, windowComponent, logger) {
        this.decorationOperatorFactory = decorationOperatorFactory;
        this.debouncer = debouncer;
        this.windowComponent = windowComponent;
        this.logger = logger;
    }
    execute() {
        const editor = this.windowComponent.activeTextEditor;
        this.debouncer.debounce(() => {
            try {
                if (editor)
                    this.refresh(editor);
            }
            catch (e) {
                this.logger.error(e.stack);
            }
        });
    }
    refresh(editor) {
        const decorationOperator = this.decorationOperatorFactory.create([editor]);
        decorationOperator.refreshDecorations();
    }
}
exports.default = AutoRefreshDecorationWithDelay;
//# sourceMappingURL=auto-refresh-decoration-with-delay.js.map