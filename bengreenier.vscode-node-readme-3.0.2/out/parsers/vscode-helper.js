"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Calls a given parser from vscode constructs
 * @param line the vscode editor line
 * @param pos the vscode editor position
 * @param parserFn the generic parser to call
 */
function vscodeHelper(line, pos, parserFn) {
    return parserFn(line.text, pos.character);
}
exports.vscodeHelper = vscodeHelper;
//# sourceMappingURL=vscode-helper.js.map