"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("./common/collection");
const Array_1 = require("fp-ts/lib/Array");
class TextLocationRegistry {
    constructor() {
        this.recordMap = new collection_1.OptionMap();
    }
    register(editorId, decorationId, ranges) {
        const editorDecorations = this.recordMap.get(editorId).getOrElse(new collection_1.OptionMap());
        editorDecorations.set(decorationId, ranges);
        this.recordMap.set(editorId, editorDecorations);
    }
    deregister(decorationId) {
        [...this.recordMap.values()].forEach(decorationIdMap => {
            decorationIdMap.delete(decorationId);
        });
    }
    queryDecorationId(editorId, range) {
        return this.findDecorationIdAndRanges(editorId, range).map(([decorationId]) => decorationId);
    }
    findNextOccurence(editorId, range) {
        return this.findDecorationIdAndRanges(editorId, range)
            .map(([_, ranges]) => {
            const newIndex = ranges.findIndex(this.isPointingRange(range)) + 1;
            return ranges[newIndex === ranges.length ? 0 : newIndex];
        });
    }
    findPreviousOccurence(editorId, range) {
        return this.findDecorationIdAndRanges(editorId, range)
            .map(([_, ranges]) => {
            const newIndex = ranges.findIndex(this.isPointingRange(range)) - 1;
            return ranges[newIndex < 0 ? ranges.length - 1 : newIndex];
        });
    }
    findDecorationIdAndRanges(editorId, range) {
        return this.recordMap.get(editorId).chain(decorationMap => Array_1.findFirst([...decorationMap.entries()], ([_decorationId, ranges]) => ranges.some(this.isPointingRange(range))));
    }
    isPointingRange(range2) {
        return (range1) => {
            if (range2.start < range1.start || range2.end > range1.end)
                return false;
            return range2.start === range2.end ||
                (range1.start === range2.start && range1.end === range2.end);
        };
    }
}
exports.default = TextLocationRegistry;
//# sourceMappingURL=text-location-registry.js.map