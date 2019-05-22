"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prettyHrtime = require("pretty-hrtime");
class Stopwatch {
    constructor() {
        this.isStopped = false;
        this.time = process.hrtime();
    }
    static startNew() {
        return new Stopwatch();
    }
    stop() {
        if (!this.isStopped) {
            this.time = process.hrtime(this.time);
            this.isStopped = true;
        }
    }
    toString() {
        this.stop();
        return prettyHrtime(this.time);
    }
}
exports.Stopwatch = Stopwatch;
//# sourceMappingURL=stopwatch.js.map