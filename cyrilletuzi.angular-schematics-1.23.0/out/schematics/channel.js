"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Output {
    static get channel() {
        if (!this._channel) {
            this._channel = vscode.window.createOutputChannel('Angular schematics');
        }
        return this._channel;
    }
    static dispose() {
        if (this._channel) {
            this._channel.dispose();
        }
    }
}
Output._channel = null;
exports.Output = Output;
//# sourceMappingURL=channel.js.map