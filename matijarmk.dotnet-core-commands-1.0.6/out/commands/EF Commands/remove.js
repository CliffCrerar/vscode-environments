"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeCommand_1 = require("../../executeCommand");
function remove() {
    executeCommand_1.executeCommandInOutputChannel(["ef migrations remove"], true, false);
}
exports.remove = remove;
//# sourceMappingURL=remove.js.map