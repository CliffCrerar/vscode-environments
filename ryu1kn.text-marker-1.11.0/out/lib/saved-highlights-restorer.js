"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("./const");
const decoration_entry_parser_1 = require("./decoration/decoration-entry-parser");
const pattern_factory_1 = require("./pattern/pattern-factory");
class SavedHighlightsRestorer {
    constructor(configStore, decorationOperatorFactory, matchingModeRegistry, eventBus) {
        this.configStore = configStore;
        this.decorationOperatorFactory = decorationOperatorFactory;
        this.patternFactory = new pattern_factory_1.default(matchingModeRegistry);
        this.eventBus = eventBus;
        this.decorationEntryParser = new decoration_entry_parser_1.default();
        this.registerListeners();
    }
    registerListeners() {
        this.eventBus.on(const_1.Event.EXTENSION_READY, this.restore.bind(this));
    }
    restore() {
        const decorationsData = this.configStore.savedHighlights;
        const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
        decorationsData.forEach(decorationData => this.addDecoration(decorationData, decorationOperator));
    }
    addDecoration(decorationData, decorationOperator) {
        const patternData = this.decorationEntryParser.getPattern(decorationData);
        const pattern = this.patternFactory.create(patternData);
        decorationOperator.addDecoration(pattern, decorationData.color);
    }
}
exports.default = SavedHighlightsRestorer;
//# sourceMappingURL=saved-highlights-restorer.js.map