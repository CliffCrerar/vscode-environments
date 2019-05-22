"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const go_to_highlight_1 = require("./go-to-highlight");
class GoToPreviousHighlightCommand extends go_to_highlight_1.GoToHighlightCommand {
    constructor(matchingModeRegistry, textLocationRegistry, decorationRegistry, decorationTypeRegistry, windowComponent) {
        super(matchingModeRegistry, textLocationRegistry, decorationRegistry, decorationTypeRegistry, windowComponent);
    }
    findTargetLocation(editor) {
        return this.textLocationRegistry.findPreviousOccurence(editor.id, editor.selection);
    }
}
exports.GoToPreviousHighlightCommand = GoToPreviousHighlightCommand;
//# sourceMappingURL=go-to-previous-highlight.js.map