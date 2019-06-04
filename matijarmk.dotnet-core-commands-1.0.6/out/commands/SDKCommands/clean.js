"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeCommand_1 = require("../../executeCommand");
function clean() {
    executeCommand_1.executeCommandInOutputChannel(["clean"], true, false);
}
exports.clean = clean;
//# sourceMappingURL=clean.js.map