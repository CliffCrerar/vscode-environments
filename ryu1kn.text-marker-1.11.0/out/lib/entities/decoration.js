"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Decoration {
    constructor(id, pattern, colour) {
        this.id = id;
        this.pattern = pattern;
        this.colour = colour;
    }
    withCaseSensitivityToggled() {
        return this.withPattern(this.pattern.toggleCaseSensitivity());
    }
    withWholeMatchToggled() {
        return this.withPattern(this.pattern.toggleWholeMatch());
    }
    withPhrase(phrase) {
        return this.withPattern(this.pattern.updatePhrase(phrase));
    }
    withPattern(newPattern) {
        return new Decoration(this.id, newPattern, this.colour);
    }
    withColour(colour) {
        return new Decoration(this.id, this.pattern, colour);
    }
}
exports.Decoration = Decoration;
//# sourceMappingURL=decoration.js.map