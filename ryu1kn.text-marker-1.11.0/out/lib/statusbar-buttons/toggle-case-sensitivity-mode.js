"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Const = require("../const");
const Event = Const.Event;
class ToggleCaseSensitivityModeButton {
    constructor(eventBus, statusBarItem) {
        this.eventBus = eventBus;
        this.statusBarItem = statusBarItem;
        this.registerListeners();
    }
    registerListeners() {
        this.eventBus.on(Event.MATCHING_MODE_INITIALISED, this.initialiseButton.bind(this));
        this.eventBus.on(Event.TOGGLED_CASE_SENSITIVITY, this.updateButton.bind(this));
    }
    initialiseButton(params) {
        this.updateButton(params);
        this.statusBarItem.command = `${Const.EXTENSION_ID}.toggleModeForCaseSensitivity`;
        this.statusBarItem.show();
    }
    updateButton({ ignoreCase }) {
        const statusBarItem = this.statusBarItem;
        if (ignoreCase) {
            statusBarItem.text = 'Aa';
            statusBarItem.tooltip = `${Const.EXTENSION_NAME}: Case Insensitive Mode`;
        }
        else {
            statusBarItem.text = '[Aa]';
            statusBarItem.tooltip = `${Const.EXTENSION_NAME}: Case Sensitive Mode`;
        }
    }
}
exports.default = ToggleCaseSensitivityModeButton;
//# sourceMappingURL=toggle-case-sensitivity-mode.js.map