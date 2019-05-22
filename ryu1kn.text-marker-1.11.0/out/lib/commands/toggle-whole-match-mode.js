"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ToggleWholeMatchModeCommand {
    constructor(matchingModeRegistry) {
        this.matchingModeRegistry = matchingModeRegistry;
    }
    execute() {
        this.matchingModeRegistry.toggleWholeMatch();
    }
}
exports.default = ToggleWholeMatchModeCommand;
//# sourceMappingURL=toggle-whole-match-mode.js.map