"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeCommand_1 = require("../../executeCommand");
function dbcontextList() {
    executeCommand_1.executeCommandInOutputChannel(["ef dbcontext list"], true, false);
}
exports.dbcontextList = dbcontextList;
//# sourceMappingURL=dbcontextlist.1.js.map