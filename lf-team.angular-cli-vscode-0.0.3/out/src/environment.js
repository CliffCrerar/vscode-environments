"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = require("child_process");
class Environment {
    static execSync(commands, cwd) {
        console.log(commands, cwd);
        return childProcess.execSync(commands, { cwd: cwd }).toString().trim();
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map