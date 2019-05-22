"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Parser for const lib = require('lib')
 */
function requireParser(text, pos) {
    let moduleName;
    let re = /require\(['"]([^'"]+)['"](?:, ['"]([^'"]+)['"])?\);?/g;
    let str = text;
    let matched;
    while ((matched = re.exec(str)) != null) {
        if (matched.index <= pos && pos <= re.lastIndex) {
            moduleName = matched[1];
            break;
        }
    }
    return moduleName;
}
exports.requireParser = requireParser;
//# sourceMappingURL=require.js.map