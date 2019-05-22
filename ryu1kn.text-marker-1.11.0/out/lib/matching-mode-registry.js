"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("./const");
class MatchingModeRegistry {
    constructor(ignoreCase, wholeMatch, eventBus) {
        this.eventBus = eventBus;
        this.ignoreCase = ignoreCase;
        this.wholeMatch = wholeMatch;
        this.broadcastReady();
    }
    broadcastReady() {
        this.eventBus.once(const_1.Event.EXTENSION_READY, () => {
            this.eventBus.emit(const_1.Event.MATCHING_MODE_INITIALISED, this.mode);
        });
    }
    toggleCaseSensitivity() {
        this.ignoreCase = !this.ignoreCase;
        this.eventBus.emit(const_1.Event.TOGGLED_CASE_SENSITIVITY, { ignoreCase: this.ignoreCase });
    }
    toggleWholeMatch() {
        this.wholeMatch = !this.wholeMatch;
        this.eventBus.emit(const_1.Event.WHOLE_MATCH_MODE_TOGGLED, { wholeMatch: this.wholeMatch });
    }
    get mode() {
        return {
            ignoreCase: this.ignoreCase,
            wholeMatch: this.wholeMatch
        };
    }
}
exports.default = MatchingModeRegistry;
//# sourceMappingURL=matching-mode-registry.js.map