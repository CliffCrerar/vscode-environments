"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const go_to_highlight_1 = require("./go-to-highlight");
class GoToNextHighlightCommand extends go_to_highlight_1.GoToHighlightCommand {
    constructor(matchingModeRegistry, textLocationRegistry, decorationRegistry, decorationTypeRegistry, windowComponent) {
        super(matchingModeRegistry, textLocationRegistry, decorationRegistry, decorationTypeRegistry, windowComponent);
    }
    findTargetLocation(editor) {
        return this.textLocationRegistry.findNextOccurence(editor.id, editor.selection);
    }
}
exports.GoToNextHighlightCommand = GoToNextHighlightCommand;
//# sourceMappingURL=go-to-next-highlight.js.map