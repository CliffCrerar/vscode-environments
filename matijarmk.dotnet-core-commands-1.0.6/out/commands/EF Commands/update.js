"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const executeCommand_1 = require("../../executeCommand");
function update() {
    executeCommand_1.executeCommandInOutputChannel(["ef database update"], true, false);
}
exports.update = update;
//# sourceMappingURL=update.js.map