"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ColourRegistry {
    constructor(configStore) {
        this.configStore = configStore;
        this.inUseColours = [];
    }
    issue() {
        const colours = this.configStore.highlightColors;
        const availableColour = colours.find(colour => !this.inUseColours.includes(colour));
        const newColour = availableColour || this.configStore.defaultHighlightColor;
        this.inUseColours = this.inUseColours.concat(newColour);
        return newColour;
    }
    reserve(colour) {
        const addend = this.inUseColours.includes(colour) ? [] : [colour];
        this.inUseColours = [...this.inUseColours, ...addend];
    }
    revoke(colour) {
        this.inUseColours = this.inUseColours.filter(c => c !== colour);
    }
}
exports.default = ColourRegistry;
//# sourceMappingURL=colour-registry.js.map