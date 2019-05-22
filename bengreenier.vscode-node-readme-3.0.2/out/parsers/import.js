"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Parser for import lib from 'lib'
 * Parser for import * as lib from 'lib'
 * Parser for import {lib} from 'lib'
 * Parser for import {lib as lib} from 'lib'
 */
function importParser(text, pos) {
    let moduleName;
    let re = /import .*?from\s|("|')(.*?)("|')/g;
    let str = text;
    let matched;
    while ((matched = re.exec(str)) != null) {
        if (matched.index <= pos && pos <= re.lastIndex) {
            moduleName = matched[2];
            break;
        }
    }
    return moduleName;
}
exports.importParser = importParser;
//# sourceMappingURL=import.js.map