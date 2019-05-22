"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isNumber = require('lodash.isnumber');
class Debouncer {
    constructor(configStore) {
        this.configStore = configStore;
    }
    debounce(callback) {
        if (this.timeout)
            clearTimeout(this.timeout);
        const waitTime = this.configStore.delayForRefreshingHighlight;
        if (isNumber(waitTime)) {
            this.timeout = setTimeout(callback, waitTime);
        }
    }
}
exports.default = Debouncer;
//# sourceMappingURL=debouncer.js.map