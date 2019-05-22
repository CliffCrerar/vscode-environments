"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ToggleCaseSensitivityModeCommand {
    constructor(matchingModeRegistry) {
        this.matchingModeRegistry = matchingModeRegistry;
    }
    execute() {
        this.matchingModeRegistry.toggleCaseSensitivity();
    }
}
exports.default = ToggleCaseSensitivityModeCommand;
//# sourceMappingURL=toggle-case-sensitivity-mode.js.map