"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const CHANNEL_NAME = 'JavaScript Booster';
class LogService {
    constructor() {
        this._channel = vscode.window.createOutputChannel(CHANNEL_NAME);
    }
    output(message) {
        // tslint:disable-next-line:no-console
        console.log(`[LogService.output] ${message}`);
        this._channel.appendLine(`${new Date().toISOString()}: ${message}`);
    }
    outputError(message) {
        return this.output(`[error] ${message}`);
    }
}
exports.default = new LogService();
//# sourceMappingURL=logService.js.map