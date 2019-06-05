"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
function makeTerminalPrettyName(cwd, taskName) {
    return `${path.basename(cwd)} ~ ${taskName}`;
}
exports.makeTerminalPrettyName = makeTerminalPrettyName;
//# sourceMappingURL=utils.js.map