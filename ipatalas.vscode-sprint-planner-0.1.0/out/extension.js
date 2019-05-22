"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vsc = require("vscode");
const publish_1 = require("./commands/publish");
const iterationCompletionProvider_1 = require("./providers/iterationCompletionProvider");
const userStoryCompletionProvider_1 = require("./providers/userStoryCompletionProvider");
const store_1 = require("./store");
const azure_client_1 = require("./utils/azure-client");
const constants_1 = require("./constants");
const publishCodeLensProvider_1 = require("./providers/publishCodeLensProvider");
const logger_1 = require("./utils/logger");
const config_1 = require("./utils/config");
const activityCompletionProvider_1 = require("./providers/activityCompletionProvider");
const activityDiagnostics_1 = require("./providers/activityDiagnostics");
const activityCodeActionProvider_1 = require("./providers/activityCodeActionProvider");
const documentSelector = [
    { language: constants_1.LanguageId, scheme: 'file' },
    { language: constants_1.LanguageId, scheme: 'untitled' },
];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const logger = new logger_1.Logger();
    const config = new config_1.Configuration(logger);
    const azureClient = new azure_client_1.AzureClient(config, logger);
    const sessionStore = new store_1.SessionStore(azureClient, config, logger);
    const publishCommand = new publish_1.PublishCommand(sessionStore, azureClient, logger, config);
    const alphabet = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    const activityDiagnostics = new activityDiagnostics_1.ActivityDiagnostics(sessionStore);
    activityDiagnostics.register();
    context.subscriptions.push(...[
        logger,
        config,
        vsc.commands.registerCommand(constants_1.Commands.publish, publishCommand.publish, publishCommand),
        vsc.languages.registerCompletionItemProvider(documentSelector, new activityCompletionProvider_1.ActivityCompletionProvider(sessionStore, logger), ...alphabet),
        vsc.languages.registerCompletionItemProvider(documentSelector, new iterationCompletionProvider_1.IterationCompletionProvider(sessionStore, logger), '#'),
        vsc.languages.registerCompletionItemProvider(documentSelector, new userStoryCompletionProvider_1.UserStoryCompletionProvider(sessionStore, logger), '#'),
        vsc.languages.registerCodeLensProvider(documentSelector, new publishCodeLensProvider_1.PublishCodeLensProvider()),
        vsc.languages.registerCodeActionsProvider(documentSelector, new activityCodeActionProvider_1.ActivityCodeActionProvider(sessionStore, logger)),
        activityDiagnostics
    ]);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map