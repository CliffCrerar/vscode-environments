"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const highlight_1 = require("./entities/highlight");
const PATTERN_TYPE_MAP = new Map([
    ['String', highlight_1.PatternType.STRING],
    ['RegExp', highlight_1.PatternType.REGEX]
]);
exports.getExternalName = (internalName) => PATTERN_TYPE_MAP.get(internalName);
exports.getInternalName = (externalName) => {
    const found = Array.from(PATTERN_TYPE_MAP.entries())
        .find(([_iName, eName]) => eName === externalName);
    return found && found[0];
};
//# sourceMappingURL=pattern-type-name.js.map