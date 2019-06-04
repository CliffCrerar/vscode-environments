"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Output {
    constructor(_channel, _config) {
        this._channel = _channel;
        this._config = _config;
    }
    appendText(description) {
        if (this._config.showOutputAutomatically) {
            this._channel.show();
        }
        this._channel.appendLine(description);
    }
}
exports.Output = Output;
//# sourceMappingURL=output.js.map