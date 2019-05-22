"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pattern_1 = require("./pattern");
class RegexPattern extends pattern_1.default {
    constructor() {
        super(...arguments);
        this.type = 'RegExp';
    }
    get displayText() {
        const caseFlag = this.ignoreCase ? 'i' : '';
        return new RegExp(this.phrase, caseFlag).toString();
    }
    findCandidateRanges(text) {
        const adjustedPattern = this.getAdjustedRegex();
        const ranges = [];
        text.replace(adjustedPattern, (match, ...args) => {
            const matchLength = match.length;
            if (matchLength > 0) {
                const offset = args[args.length - 2];
                ranges.push({
                    start: offset,
                    end: offset + matchLength
                });
            }
            return match;
        });
        return ranges;
    }
    create(params) {
        return new RegexPattern(params);
    }
    getAdjustedRegex() {
        const flags = this.ignoreCase ? 'gi' : 'g';
        return new RegExp(this.phrase, flags);
    }
}
exports.default = RegexPattern;
//# sourceMappingURL=regex.js.map