"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pattern_1 = require("./pattern");
class StringPattern extends pattern_1.default {
    constructor() {
        super(...arguments);
        this.type = 'String';
    }
    get displayText() {
        return this.phrase;
    }
    findCandidateRanges(text) {
        const memo = {
            ranges: [],
            lastOffset: 0
        };
        const textInFrontOfSelectedText = this.getTextForComparison(text)
            .split(this.getPhraseForComparison())
            .slice(0, -1);
        const finalMemo = textInFrontOfSelectedText.reduce((memo, textInFront) => {
            const start = memo.lastOffset + textInFront.length;
            const end = start + this.phrase.length;
            return {
                ranges: memo.ranges.concat({ start, end }),
                lastOffset: end
            };
        }, memo);
        return finalMemo.ranges;
    }
    getPhraseForComparison() {
        return this.ignoreCase ? this.phrase.toLowerCase() : this.phrase;
    }
    getTextForComparison(text) {
        return this.ignoreCase ? text.toLowerCase() : text;
    }
    create(params) {
        return new StringPattern(params);
    }
}
exports.default = StringPattern;
//# sourceMappingURL=string.js.map