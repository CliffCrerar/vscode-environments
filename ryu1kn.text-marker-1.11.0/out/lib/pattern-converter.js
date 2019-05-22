"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("./const");
class PatternConverter {
    convert(pattern, convertAction) {
        switch (convertAction) {
            case const_1.PatternAction.TOGGLE_CASE_SENSITIVITY:
                return pattern.toggleCaseSensitivity();
            case const_1.PatternAction.TOGGLE_WHOLE_MATCH:
                return pattern.toggleWholeMatch();
            default:
                throw new Error(`Unknown action ${convertAction.toString()}`);
        }
    }
}
exports.default = PatternConverter;
//# sourceMappingURL=pattern-converter.js.map