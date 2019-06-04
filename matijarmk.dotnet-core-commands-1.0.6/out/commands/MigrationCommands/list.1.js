"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeCommand_1 = require("../../executeCommand");
function list() {
    executeCommand_1.executeCommandInOutputChannel(["ef migrations list"], true, false);
}
exports.list = list;
//# sourceMappingURL=list.1.js.map