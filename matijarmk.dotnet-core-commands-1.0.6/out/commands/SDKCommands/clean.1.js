"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeCommand_1 = require("../../executeCommand");
function restore() {
    executeCommand_1.executeCommandInOutputChannel(["restore"], true, false);
}
exports.restore = restore;
//# sourceMappingURL=clean.1.js.map