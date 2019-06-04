"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeCommand_1 = require("../../executeCommand");
function dbcontextInfo() {
    executeCommand_1.executeCommandInOutputChannel(["ef dbcontext info"], true, false);
}
exports.dbcontextInfo = dbcontextInfo;
//# sourceMappingURL=dbcontexinfo.js.map