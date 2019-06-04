"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeCommand_1 = require("../../executeCommand");
function script() {
    executeCommand_1.executeCommandInOutputChannel(["ef migrations script"], true, false);
}
exports.script = script;
//# sourceMappingURL=script.1.js.map