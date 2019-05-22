"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Const = require("../const");
const Event = Const.Event;
class ToggleWholeMatchModeButton {
    constructor(eventBus, statusBarItem) {
        this.eventBus = eventBus;
        this.statusBarItem = statusBarItem;
        this.registerListeners();
    }
    registerListeners() {
        this.eventBus.on(Event.MATCHING_MODE_INITIALISED, this.initialiseButton.bind(this));
        this.eventBus.on(Event.WHOLE_MATCH_MODE_TOGGLED, this.updateButton.bind(this));
    }
    initialiseButton(params) {
        this.updateButton(params);
        this.statusBarItem.command = `${Const.EXTENSION_ID}.toggleModeForWholeMatch`;
        this.statusBarItem.show();
    }
    updateButton({ wholeMatch }) {
        const statusBarItem = this.statusBarItem;
        if (wholeMatch) {
            statusBarItem.text = '[Ab|]';
            statusBarItem.tooltip = `${Const.EXTENSION_NAME}: Whole Match Mode`;
        }
        else {
            statusBarItem.text = 'Ab|';
            statusBarItem.tooltip = `${Const.EXTENSION_NAME}: Non-Whole Match Mode`;
        }
    }
}
exports.default = ToggleWholeMatchModeButton;
//# sourceMappingURL=toggle-whole-match-mode.js.map