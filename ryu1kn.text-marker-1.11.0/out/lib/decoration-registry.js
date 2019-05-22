"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const text_decoration_collection_1 = require("./text-decoration-collection");
const colour_registry_1 = require("./colour-registry");
const getColorContrast = require('../../lib-3rd-party/dynamic-contrast');
const OVERVIEW_RULER_COLOUR = 'violet';
class DecorationRegistry {
    constructor(configStore, window, generateUuid) {
        this.colourRegistry = new colour_registry_1.default(configStore);
        this.configStore = configStore;
        this.window = window;
        this.textDecorationMap = new text_decoration_collection_1.default(generateUuid);
    }
    inquireById(decorationId) {
        return this.textDecorationMap.get(decorationId);
    }
    inquireByPattern(pattern) {
        const isSamePattern = (decoration) => decoration.pattern.equalTo(pattern);
        return this.textDecorationMap.find(isSamePattern);
    }
    issue(pattern) {
        const decoration = this.inquireByPattern(pattern);
        if (decoration)
            return null;
        const colour = this.colourRegistry.issue();
        const decorationType = this.generateDecorationType(colour);
        return this.textDecorationMap.add(pattern, colour, decorationType);
    }
    updatePattern(decorationId, newPattern) {
        const decoration = this.textDecorationMap.get(decorationId);
        decoration.pattern = newPattern;
        return decoration;
    }
    revoke(decorationId) {
        const decoration = this.textDecorationMap.get(decorationId);
        this.colourRegistry.revoke(decoration.colour);
        this.textDecorationMap.remove(decorationId);
    }
    retrieveAll() {
        return this.textDecorationMap.toList();
    }
    generateDecorationType(colour) {
        return this.window.createTextEditorDecorationType(Object.assign({
            backgroundColor: colour,
            borderRadius: '.2em',
            overviewRulerColor: this.configStore.useHighlightColorOnRuler ? colour : OVERVIEW_RULER_COLOUR,
            overviewRulerLane: vscode_1.OverviewRulerLane.Center
        }, this.configStore.autoSelectDistinctiveTextColor && { color: getColorContrast(colour) }));
    }
}
exports.default = DecorationRegistry;
//# sourceMappingURL=decoration-registry.js.map