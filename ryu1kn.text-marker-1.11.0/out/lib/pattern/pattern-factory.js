"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regex_1 = require("./regex");
const string_1 = require("./string");
class PatternFactory {
    constructor(matchingModeRegistry) {
        this.matchingModeRegistry = matchingModeRegistry;
    }
    create(params) {
        const finalParams = Object.assign({}, this.matchingModeRegistry.mode, params);
        return params.type === 'RegExp' ?
            new regex_1.default(finalParams) :
            new string_1.default(finalParams);
    }
}
exports.default = PatternFactory;
//# sourceMappingURL=pattern-factory.js.map