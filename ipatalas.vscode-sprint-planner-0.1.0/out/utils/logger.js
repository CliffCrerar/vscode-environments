"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vsc = require("vscode");
const stopwatch_1 = require("./stopwatch");
class Logger {
    constructor() {
        this.isLineStillOpen = false;
        this.logger = vsc.window.createOutputChannel('Azure DevOps planner');
    }
    log(text, appendLine = true) {
        if (this.isLineStillOpen) {
            this.logger.appendLine('');
            this.isLineStillOpen = false;
        }
        let message = `[${this.buildTimestamp()}] ${text}`;
        if (appendLine) {
            this.logger.appendLine(message);
        }
        else {
            this.logger.append(message);
            this.isLineStillOpen = true;
            return (text) => {
                this.logger.appendLine(text);
                this.isLineStillOpen = false;
            };
        }
    }
    perf(text) {
        const finishLogLine = this.log(text, false);
        const stopwatch = stopwatch_1.Stopwatch.startNew();
        return () => finishLogLine(` ${stopwatch.toString()}`);
    }
    buildTimestamp() {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const millis = Number(now.getMilliseconds()).toLocaleString(undefined, { minimumIntegerDigits: 3 });
        return `${time}.${millis}`;
    }
    dispose() {
        this.logger.dispose();
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map