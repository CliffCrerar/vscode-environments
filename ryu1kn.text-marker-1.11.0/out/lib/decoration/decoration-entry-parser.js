"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pattern_type_name_1 = require("../pattern/pattern-type-name");
class DecorationEntryParser {
    getPattern(decorationData) {
        const pattern = decorationData.pattern;
        return {
            type: pattern_type_name_1.getInternalName(pattern.type),
            phrase: pattern.expression,
            ignoreCase: pattern.ignoreCase,
            wholeMatch: pattern.wholeMatch
        };
    }
}
exports.default = DecorationEntryParser;
//# sourceMappingURL=decoration-entry-parser.js.map