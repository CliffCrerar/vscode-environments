"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Const = require("./const");
const command_factory_1 = require("./command-factory");
const command_1 = require("./vscode/command");
class AppIntegrator {
    static create(vscode, logger) {
        const commandFactory = new command_factory_1.default(vscode, logger);
        const commandComponent = new command_1.default(vscode.commands, logger);
        return new AppIntegrator(commandFactory, vscode, commandComponent);
    }
    constructor(commandFactory, vscode, commandComponent) {
        this.commandFactory = commandFactory;
        this.vscode = vscode;
        this.commandComponent = commandComponent;
    }
    integrate(context) {
        this.registerCommands(context);
        this.registerEventListeners(context);
        this.prepareExtensionEventsDrivenItems();
        this.broadcastReady();
    }
    registerEventListeners(context) {
        const autoRefreshDecoration = this.commandFactory.createAutoRefreshDecoration();
        this.vscode.window.onDidChangeActiveTextEditor(autoRefreshDecoration.execute, autoRefreshDecoration, context.subscriptions);
        const autoRefreshDecorationWithDelay = this.commandFactory.createAutoRefreshDecorationWithDelay();
        this.vscode.workspace.onDidChangeTextDocument(autoRefreshDecorationWithDelay.execute, autoRefreshDecorationWithDelay, context.subscriptions);
    }
    registerCommands(context) {
        this.getCommands().forEach(command => {
            const disposable = this.commandComponent.registerCommand(command);
            context.subscriptions.push(disposable);
        });
    }
    prepareExtensionEventsDrivenItems() {
        this.commandFactory.createSavedHighlightsRestorer();
        if (!this.commandFactory.getConfigStore().hideStatusBarItems) {
            this.commandFactory.createToggleCaseSensitivityModeButton();
            this.commandFactory.createToggleWholeMatchModeButton();
        }
    }
    broadcastReady() {
        this.commandFactory.getEventBus().emit(Const.Event.EXTENSION_READY);
    }
    getCommands() {
        const factory = this.commandFactory;
        return [
            {
                name: `${Const.EXTENSION_ID}.highlightUsingRegex`,
                command: factory.createHighlightUsingRegex(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.clearAllHighlight`,
                command: factory.createRemoveAllHighlightsCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.saveAllHighlights`,
                command: factory.createSaveAllHighlightsCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.toggleCaseSensitivity`,
                command: factory.createToggleCaseSensitivityCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.toggleModeForCaseSensitivity`,
                command: factory.createToggleCaseSensitivityModeCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.toggleWholeMatch`,
                command: factory.createToggleWholeMatchCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.toggleModeForWholeMatch`,
                command: factory.createToggleWholeMatchModeCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.unhighlight`,
                command: factory.createUnhighlightCommand(),
                type: 'GENERAL'
            }, {
                name: `${Const.EXTENSION_ID}.goToNextHighlight`,
                command: factory.createGoToNextHighlightCommand(),
                type: 'TEXT_EDITOR'
            }, {
                name: `${Const.EXTENSION_ID}.goToPreviousHighlight`,
                command: factory.createGoToPreviousHighlightCommand(),
                type: 'TEXT_EDITOR'
            }, {
                name: `${Const.EXTENSION_ID}.toggleHighlight`,
                command: factory.createToggleHighlightCommand(),
                type: 'TEXT_EDITOR'
            }, {
                name: `${Const.EXTENSION_ID}.updateHighlight`,
                command: factory.createUpdateHighlightCommand(),
                type: 'TEXT_EDITOR'
            }
        ];
    }
}
exports.default = AppIntegrator;
//# sourceMappingURL=app-integrator.js.map