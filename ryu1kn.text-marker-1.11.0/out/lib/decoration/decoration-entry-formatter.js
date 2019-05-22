"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pattern_type_name_1 = require("../pattern/pattern-type-name");
class DecorationEntryFormatter {
    format(decoration) {
        const pattern = decoration.pattern;
        return {
            pattern: {
                type: pattern_type_name_1.getExternalName(pattern.type),
                expression: pattern.phrase,
                ignoreCase: pattern.ignoreCase,
                wholeMatch: pattern.wholeMatch
            },
            color: decoration.colour
        };
    }
}
exports.default = DecorationEntryFormatter;
//# sourceMappingURL=decoration-entry-formatter.js.map