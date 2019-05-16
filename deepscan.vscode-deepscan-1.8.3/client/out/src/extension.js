/* --------------------------------------------------------------------------------------------
 * Copyright (c) S-Core Co., Ltd. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const types_1 = require("./types");
const disableRulesCodeActionProvider_1 = require("./actions/disableRulesCodeActionProvider");
const showRuleCodeActionProvider_1 = require("./actions/showRuleCodeActionProvider");
const deepscanDecorators_1 = require("./deepscanDecorators");
const packageJSON = vscode.extensions.getExtension('DeepScan.vscode-deepscan').packageJSON;
// For the support of '.vue' support by languageIds, 'vue' language should be installed.
//const languageIds = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'vue'];
const DEFAULT_FILE_SUFFIXES = ['.js', '.jsx', '.ts', '.tsx', '.vue'];
let supportedFileSuffixes = null;
let fileSuffixes = null;
const exitCalled = new vscode_languageclient_1.NotificationType('deepscan/exitCalled');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const workspaceRootPath = vscode.workspace.rootPath;
    if (!workspaceRootPath) {
        return;
    }
    activateClient(context);
    console.log(`Congratulations, your extension "${packageJSON.name} ${packageJSON.version}" is now active!`);
}
exports.activate = activate;
function activateClient(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let statusBarMessage = null;
        function updateStatus(status) {
            let tooltip = statusBarItem.tooltip;
            switch (status) {
                case types_1.Status.none:
                    statusBarItem.color = undefined;
                    break;
                case types_1.Status.ok:
                    statusBarItem.color = 'lightgreen';
                    tooltip = 'Issue-free!';
                    break;
                case types_1.Status.warn:
                    statusBarItem.color = 'yellow';
                    tooltip = 'Issue(s) detected!';
                    break;
                case types_1.Status.fail:
                    statusBarItem.color = 'darkred';
                    tooltip = 'Inspection failed!';
                    break;
            }
            statusBarItem.tooltip = tooltip;
            deepscanStatus = status;
            updateStatusBar(vscode.window.activeTextEditor);
        }
        function clearNotification() {
            if (statusBarMessage) {
                statusBarMessage.dispose();
            }
        }
        function showNotificationIfNeeded(params) {
            clearNotification();
            if (params.state === types_1.Status.fail) {
                statusBarMessage = vscode.window.setStatusBarMessage(`A problem occurred communicating with DeepScan server. (${params.error})`);
            }
        }
        function updateStatusBar(editor) {
            let show = serverRunning &&
                (deepscanStatus === types_1.Status.fail || (editor && _.includes(supportedFileSuffixes, path.extname(editor.document.fileName))));
            showStatusBarItem(show);
        }
        function showStatusBarItem(show) {
            if (show) {
                statusBarItem.show();
            }
            else {
                statusBarItem.hide();
            }
        }
        function changeConfiguration() {
            clearNotification();
            let oldFileSuffixes = fileSuffixes;
            initializeSupportedFileSuffixes(getDeepScanConfiguration());
            // NOTE:
            // To apply changed file suffixes directly, documentSelector of LanguageClient should be changed.
            // But it seems to be impossible, so VS Code needs to restart.
            if (!_.isEqual(fileSuffixes, oldFileSuffixes)) {
                const reload = 'Reload Now';
                vscode.window.showInformationMessage('Restart VS Code before the new \'deepscan.fileSuffixes\' setting will take affect.', ...[reload])
                    .then(selection => {
                    if (selection === reload) {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
                ;
            }
        }
        function getFileSuffixes(configuration) {
            return configuration ? configuration.get('fileSuffixes', []) : [];
        }
        function initializeSupportedFileSuffixes(configuration) {
            fileSuffixes = getFileSuffixes(configuration);
            supportedFileSuffixes = _.union(DEFAULT_FILE_SUFFIXES, fileSuffixes);
        }
        let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
        let deepscanStatus = types_1.Status.ok;
        let serverRunning = false;
        statusBarItem.text = 'DeepScan';
        statusBarItem.command = types_1.CommandIds.showOutput;
        vscode.window.onDidChangeActiveTextEditor(updateStatusBar);
        updateStatusBar(vscode.window.activeTextEditor);
        // We need to go two levels up since an extension compile the js code into the output folder.
        let serverModule = path.join(__dirname, '..', '..', 'server', 'src', 'server.js');
        let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
        let serverOptions = {
            run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
            debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
        };
        let configuration = getDeepScanConfiguration();
        // Support other file suffixes other than DeepScan server supports.
        initializeSupportedFileSuffixes(configuration);
        let defaultErrorHandler;
        let serverCalledProcessExit = false;
        let staticDocuments = _.map(supportedFileSuffixes, fileSuffix => ({ scheme: 'file', pattern: `**/*${fileSuffix}` }));
        let staticDocumentsForDisablingRules = _.filter(staticDocuments, ({ pattern }) => pattern !== '**/*.vue');
        let activeDecorations;
        let clientOptions = {
            documentSelector: staticDocuments,
            diagnosticCollectionName: 'deepscan',
            revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
            synchronize: {
                // Synchronize the setting section 'deepscan' to the server
                configurationSection: 'deepscan'
            },
            initializationOptions: () => {
                const defaultUrl = 'https://deepscan.io';
                return {
                    server: configuration ? configuration.get('server', defaultUrl) : defaultUrl,
                    DEFAULT_FILE_SUFFIXES,
                    fileSuffixes: getFileSuffixes(configuration),
                    userAgent: `${packageJSON.name}/${packageJSON.version}`
                };
            },
            initializationFailedHandler: (error) => {
                client.error('Server initialization failed.', error);
                client.outputChannel.show(true);
                return false;
            },
            errorHandler: {
                error: (error, message, count) => {
                    return defaultErrorHandler.error(error, message, count);
                },
                closed: () => {
                    if (serverCalledProcessExit) {
                        return vscode_languageclient_1.CloseAction.DoNotRestart;
                    }
                    return defaultErrorHandler.closed();
                }
            },
            middleware: {
                didChange: (event, next) => {
                    // For less noise, hide inline decorators when typing
                    if (event.document === vscode.window.activeTextEditor.document) {
                        activeDecorations.clearDecorations(event.document.uri.toString());
                        next(event);
                    }
                }
            }
        };
        let client = new vscode_languageclient_1.LanguageClient('DeepScan', serverOptions, clientOptions);
        defaultErrorHandler = client.createDefaultErrorHandler();
        const running = 'DeepScan server is running.';
        const stopped = 'DeepScan server stopped.';
        client.onDidChangeState((event) => {
            if (event.newState === vscode_languageclient_1.State.Running) {
                client.info(running);
                statusBarItem.tooltip = running;
                serverRunning = true;
            }
            else {
                client.info(stopped);
                statusBarItem.tooltip = stopped;
                serverRunning = false;
            }
            updateStatusBar(vscode.window.activeTextEditor);
        });
        client.onReady().then(() => {
            console.log('Client is ready.');
            activeDecorations = deepscanDecorators_1.activateDecorations(client);
            context.subscriptions.push(activeDecorations.disposables);
            client.onNotification(types_1.StatusNotification.type, (params) => {
                const { state, uri } = params;
                updateStatus(state);
                showNotificationIfNeeded(params);
                activeDecorations.updateDecorations(uri);
            });
            client.onNotification(exitCalled, (params) => {
                serverCalledProcessExit = true;
                client.error(`Server process exited with code ${params[0]}. This usually indicates a misconfigured setup.`, params[1]);
                vscode.window.showErrorMessage(`DeepScan server shut down. See 'DeepScan' output channel for details.`);
            });
        });
        // The command has been defined in the package.json file
        // Now provide the implementation of the command with  registerCommand
        // The commandId parameter must match the command field in package.json
        let inspectCommand = vscode.commands.registerCommand('deepscan.inspect', () => {
            let textEditor = vscode.window.activeTextEditor;
            if (!textEditor) {
                return;
            }
            let textDocument = {
                uri: textEditor.document.uri.toString(),
                version: textEditor.document.version
            };
            let params = {
                command: 'deepscan.tryInspect',
                arguments: [textDocument]
            };
            client.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, params).then(undefined, (error) => {
                console.error('Server failed', error);
                vscode.window.showErrorMessage('Failed to inspect. Please consider opening an issue with steps to reproduce.');
            });
        });
        let rules = [];
        try {
            let rulesObj = JSON.parse(fs.readFileSync(path.resolve(context.extensionPath, 'resources', 'deepscan-rules.json')).toString());
            rules = rulesObj.rules;
        }
        catch (e) {
            vscode.window.showWarningMessage(`Can't read or parse rule definitions: ${e.message}`);
        }
        let style = '';
        try {
            style = fs.readFileSync(path.resolve(context.extensionPath, 'resources', 'style.css')).toString();
        }
        catch (e) {
            vscode.window.showWarningMessage(`Can't read a style: ${e.message}`);
        }
        // Register code actions
        const showRuleAction = new showRuleCodeActionProvider_1.default(context, { rules, style });
        context.subscriptions.push(vscode.languages.registerCodeActionsProvider(clientOptions.documentSelector, showRuleAction));
        const disableRulesAction = new disableRulesCodeActionProvider_1.default(context);
        context.subscriptions.push(vscode.languages.registerCodeActionsProvider(staticDocumentsForDisablingRules, disableRulesAction));
        context.subscriptions.push(new vscode_languageclient_1.SettingMonitor(client, 'deepscan.enable').start(), inspectCommand, vscode.commands.registerCommand(types_1.CommandIds.showOutput, () => { client.outputChannel.show(); }), statusBarItem);
        vscode.workspace.onDidChangeConfiguration(changeConfiguration);
        yield checkSetting();
    });
}
function checkSetting() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = getDeepScanConfiguration();
        const shouldIgnore = config.get('ignoreConfirmWarning') === true;
        if (shouldIgnore) {
            return;
        }
        if (config.get('enable') === true) {
            return;
        }
        const confirm = 'Confirm';
        const neverShowAgain = 'Don\'t show again';
        const choice = yield vscode.window.showWarningMessage('Allow the DeepScan extension to transfer your code to the DeepScan server for inspection.', confirm, neverShowAgain);
        if (choice === confirm) {
            yield config.update('enable', true, false);
        }
        else if (choice === neverShowAgain) {
            yield config.update('ignoreConfirmWarning', true, false);
        }
    });
}
function getDeepScanConfiguration() {
    return vscode.workspace.getConfiguration('deepscan');
}
//# sourceMappingURL=extension.js.map