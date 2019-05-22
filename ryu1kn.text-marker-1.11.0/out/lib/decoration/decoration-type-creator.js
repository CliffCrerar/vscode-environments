"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const OVERVIEW_RULER_COLOUR = 'violet';
const getColorContrast = require('../../../lib-3rd-party/dynamic-contrast');
const rgba = require('color-rgba');
const isValidColour = (rgba) => rgba.length !== 0;
class DecorationTypeCreator {
    constructor(configStore, window) {
        this.configStore = configStore;
        this.window = window;
    }
    create(colour) {
        const backgroundColour = this.getBackgroundColor(colour);
        const overviewRulerColor = this.configStore.useHighlightColorOnRuler ?
            backgroundColour : this.getBackgroundColor(OVERVIEW_RULER_COLOUR);
        return this.window.createTextEditorDecorationType(Object.assign({
            backgroundColor: backgroundColour,
            borderRadius: '.2em',
            overviewRulerColor: overviewRulerColor,
            overviewRulerLane: vscode_1.OverviewRulerLane.Center
        }, this.configStore.autoSelectDistinctiveTextColor && { color: getColorContrast(colour) }));
    }
    getBackgroundColor(colour) {
        if (colour.startsWith('rgba(') || colour.startsWith('hsla('))
            return colour;
        const c = rgba(colour);
        if (!isValidColour(c))
            return colour;
        return `rgba(${c[0]},${c[1]},${c[2]},${this.configStore.defaultHighlightOpacity})`;
    }
}
exports.default = DecorationTypeCreator;
//# sourceMappingURL=decoration-type-creator.js.map