"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeCommand_1 = require("../../executeCommand");
function version() {
    executeCommand_1.executeCommandInOutputChannel(["--version"], true, true);
}
exports.version = version;
//# sourceMappingURL=version.1.js.map