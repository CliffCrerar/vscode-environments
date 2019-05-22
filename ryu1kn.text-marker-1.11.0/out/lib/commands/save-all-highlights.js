"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decoration_entry_formatter_1 = require("../decoration/decoration-entry-formatter");
class SaveAllHighlightsCommand {
    constructor(configStore, decorationRegistry) {
        this.configStore = configStore;
        this.decorationRegistry = decorationRegistry;
        this.decorationEntryFormatter = new decoration_entry_formatter_1.default();
    }
    execute() {
        const decorations = this.decorationRegistry.retrieveAll()
            .map(decoration => this.decorationEntryFormatter.format(decoration));
        return this.configStore.set('savedHighlights', decorations);
    }
}
exports.default = SaveAllHighlightsCommand;
//# sourceMappingURL=save-all-highlights.js.map