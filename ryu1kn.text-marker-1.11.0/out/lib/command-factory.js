"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_store_1 = require("./config-store");
const config_target_picker_1 = require("./config-target-picker");
const debouncer_1 = require("./debouncer");
const decoration_operator_factory_1 = require("./decoration/decoration-operator-factory");
const decoration_registry_1 = require("./decoration/decoration-registry");
const decoration_picker_1 = require("./decoration/decoration-picker");
const highlight_using_regex_1 = require("./commands/highlight-using-regex");
const matching_mode_registry_1 = require("./matching-mode-registry");
const decoration_variation_reader_1 = require("./decoration/decoration-variation-reader");
const remove_all_highlights_1 = require("./commands/remove-all-highlights");
const save_all_highlights_1 = require("./commands/save-all-highlights");
const saved_highlights_restorer_1 = require("./saved-highlights-restorer");
const text_location_registry_1 = require("./text-location-registry");
const toggle_case_sensitivity_1 = require("./commands/toggle-case-sensitivity");
const toggle_case_sensitivity_mode_1 = require("./statusbar-buttons/toggle-case-sensitivity-mode");
const toggle_case_sensitivity_mode_2 = require("./commands/toggle-case-sensitivity-mode");
const toggle_highlight_1 = require("./commands/toggle-highlight");
const toggle_whole_match_1 = require("./commands/toggle-whole-match");
const toggle_whole_match_mode_1 = require("./statusbar-buttons/toggle-whole-match-mode");
const toggle_whole_match_mode_2 = require("./commands/toggle-whole-match-mode");
const unhighlight_1 = require("./commands/unhighlight");
const update_highlight_1 = require("./commands/update-highlight");
const window_1 = require("./vscode/window");
const events_1 = require("events");
const auto_refresh_decoration_1 = require("./commands/auto-refresh-decoration");
const auto_refresh_decoration_with_delay_1 = require("./commands/auto-refresh-decoration-with-delay");
const go_to_next_highlight_1 = require("./commands/go-to-next-highlight");
const go_to_previous_highlight_1 = require("./commands/go-to-previous-highlight");
const command_1 = require("./commands/command");
const decoration_type_registry_1 = require("./decoration/decoration-type-registry");
const generateUuid = require('uuid/v4');
const BASE_STATUS_BAR_PRIORITY = 100;
class CommandFactory {
    constructor(vscode, logger) {
        this.vscode = vscode;
        this.logger = logger;
    }
    createToggleHighlightCommand() {
        return new toggle_highlight_1.default(this.getMatchingModeRegistry(), this.getTextLocationRegistry(), this.getDecorationRegistry(), this.getDecorationTypeRegistry(), this.getWindowComponent());
    }
    createHighlightUsingRegex() {
        return new highlight_using_regex_1.default(this.getDecorationOperatorFactory(), this.getMatchingModeRegistry(), this.getWindowComponent());
    }
    createUnhighlightCommand() {
        return new unhighlight_1.default(this.getDecorationOperatorFactory(), this.getDecorationPicker());
    }
    createRemoveAllHighlightsCommand() {
        return new remove_all_highlights_1.default(this.getDecorationOperatorFactory());
    }
    createSaveAllHighlightsCommand() {
        return new save_all_highlights_1.default(this.getConfigStore(), this.getDecorationRegistry());
    }
    createToggleCaseSensitivityCommand() {
        return new toggle_case_sensitivity_1.default(this.getDecorationOperatorFactory(), this.getDecorationPicker());
    }
    createToggleCaseSensitivityModeCommand() {
        return new toggle_case_sensitivity_mode_2.default(this.getMatchingModeRegistry());
    }
    createToggleWholeMatchCommand() {
        return new toggle_whole_match_1.default(this.getDecorationOperatorFactory(), this.getDecorationPicker());
    }
    createToggleWholeMatchModeCommand() {
        return new toggle_whole_match_mode_2.default(this.getMatchingModeRegistry());
    }
    createUpdateHighlightCommand() {
        return new update_highlight_1.default(this.getDecorationOperatorFactory(), this.getDecorationRegistry(), new decoration_variation_reader_1.default(this.getWindowComponent()), this.getTextLocationRegistry());
    }
    createGoToNextHighlightCommand() {
        return new go_to_next_highlight_1.GoToNextHighlightCommand(this.getMatchingModeRegistry(), this.getTextLocationRegistry(), this.getDecorationRegistry(), this.getDecorationTypeRegistry(), this.getWindowComponent());
    }
    createGoToPreviousHighlightCommand() {
        return new go_to_previous_highlight_1.GoToPreviousHighlightCommand(this.getMatchingModeRegistry(), this.getTextLocationRegistry(), this.getDecorationRegistry(), this.getDecorationTypeRegistry(), this.getWindowComponent());
    }
    createAutoRefreshDecoration() {
        const command = new auto_refresh_decoration_1.default(this.getDecorationOperatorFactory());
        return this._wrapCommand(command);
    }
    createAutoRefreshDecorationWithDelay() {
        const command = new auto_refresh_decoration_with_delay_1.default(this.getDecorationOperatorFactory(), new debouncer_1.default(this.getConfigStore()), this.getWindowComponent(), this.logger);
        return this._wrapCommand(command);
    }
    _wrapCommand(command) {
        return new command_1.AutoTriggerCommand(command, this.logger);
    }
    createSavedHighlightsRestorer() {
        return new saved_highlights_restorer_1.default(this.getConfigStore(), this.getDecorationOperatorFactory(), this.getMatchingModeRegistry(), this.getEventBus());
    }
    createToggleCaseSensitivityModeButton() {
        const alignment = this.vscode.StatusBarAlignment.Right;
        const priority = BASE_STATUS_BAR_PRIORITY + 1;
        return new toggle_case_sensitivity_mode_1.default(this.getEventBus(), this.vscode.window.createStatusBarItem(alignment, priority));
    }
    createToggleWholeMatchModeButton() {
        const alignment = this.vscode.StatusBarAlignment.Right;
        return new toggle_whole_match_mode_1.default(this.getEventBus(), this.vscode.window.createStatusBarItem(alignment, BASE_STATUS_BAR_PRIORITY));
    }
    getEventBus() {
        this.eventBus = this.eventBus || new events_1.EventEmitter();
        return this.eventBus;
    }
    getDecorationOperatorFactory() {
        this.decorationOperatorFactory = this.decorationOperatorFactory || this.createDecorationOperatorFactory();
        return this.decorationOperatorFactory;
    }
    getConfigStore() {
        this.configStore = this.configStore || this.createConfigStore();
        return this.configStore;
    }
    createConfigStore() {
        return new config_store_1.default(this.vscode.workspace, this.getConfigTargetPicker());
    }
    getConfigTargetPicker() {
        this.configTargetPicker = this.configTargetPicker || this.createConfigTargetPicker();
        return this.configTargetPicker;
    }
    createConfigTargetPicker() {
        return new config_target_picker_1.default(this.getWindowComponent());
    }
    getDecorationRegistry() {
        this.decorationRegistry = this.decorationRegistry || this.createDecorationRegistry();
        return this.decorationRegistry;
    }
    getDecorationTypeRegistry() {
        this.decorationTypeRegistry = this.decorationTypeRegistry || this.createDecorationTypeRegistry();
        return this.decorationTypeRegistry;
    }
    createDecorationOperatorFactory() {
        return new decoration_operator_factory_1.default(this.getDecorationRegistry(), this.getDecorationTypeRegistry(), this.getTextLocationRegistry(), this.getWindowComponent());
    }
    createDecorationRegistry() {
        const configStore = this.getConfigStore();
        return new decoration_registry_1.default(configStore, generateUuid);
    }
    createDecorationTypeRegistry() {
        return new decoration_type_registry_1.DecorationTypeRegistry(this.getConfigStore(), this.getWindowComponent());
    }
    getDecorationPicker() {
        this.decorationPicker = this.decorationPicker || this.createDecorationPicker();
        return this.decorationPicker;
    }
    createDecorationPicker() {
        return new decoration_picker_1.default(this.getDecorationRegistry(), this.getWindowComponent());
    }
    getMatchingModeRegistry() {
        this.matchingModeRegistry = this.matchingModeRegistry || this.createMatchingModeRegistry();
        return this.matchingModeRegistry;
    }
    createMatchingModeRegistry() {
        const configStore = this.getConfigStore();
        return new matching_mode_registry_1.default(configStore.enableIgnoreCase, configStore.enableWholeMatch, this.getEventBus());
    }
    getTextLocationRegistry() {
        this.textLocationRegistry = this.textLocationRegistry || new text_location_registry_1.default();
        return this.textLocationRegistry;
    }
    getWindowComponent() {
        this.windowComponent = this.windowComponent || this.createWindowComponent();
        return this.windowComponent;
    }
    createWindowComponent() {
        return new window_1.default(this.vscode.window);
    }
}
exports.default = CommandFactory;
//# sourceMappingURL=command-factory.js.map