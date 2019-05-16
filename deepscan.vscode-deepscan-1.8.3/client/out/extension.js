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
const child_process = require("child_process");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const types_1 = require("./types");
const disableRulesCodeActionProvider_1 = require("./actions/disableRulesCodeActionProvider");
const showRuleCodeActionProvider_1 = require("./actions/showRuleCodeActionProvider");
const deepscanDecorators_1 = require("./deepscanDecorators");
const StatusBar_1 = require("./StatusBar");
const utils_1 = require("./utils");
const packageJSON = vscode.extensions.getExtension('DeepScan.vscode-deepscan').packageJSON;
// Just use file extensions rather than languageIds because a languageId needs an installation of the language.
const DEFAULT_FILE_SUFFIXES = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.mjs'];
const DIAGNOSTIC_SOURCE_NAME = 'deepscan';
let oldConfig;
const exitCalled = new vscode_languageclient_1.NotificationType('deepscan/exitCalled');
let client = null;
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
            statusBar.update(status);
            updateStatusBar(vscode.window.activeTextEditor);
        }
        function clearNotification() {
            statusBarMessage && statusBarMessage.dispose();
        }
        function showNotificationIfNeeded(params) {
            clearNotification();
            if (params.state === types_1.Status.fail) {
                statusBarMessage = vscode.window.setStatusBarMessage(`A problem occurred communicating with DeepScan server. (${params.message})`);
            }
            else if (params.message) {
                statusBarMessage = vscode.window.setStatusBarMessage(`${params.message}`);
            }
        }
        function updateStatusBar(editor) {
            const isValidSuffix = editor && _.includes(getSupportedFileSuffixes(getDeepScanConfiguration()), path.extname(editor.document.fileName));
            const show = serverRunning && (statusBar.getStatus() === types_1.Status.fail || isValidSuffix);
            statusBar.show(show);
        }
        function isConfigurationChanged(key, oldConfig, newConfig) {
            return !_.isEqual(oldConfig.get(key), newConfig.get(key));
        }
        function changeConfiguration() {
            clearNotification();
            const newConfig = getDeepScanConfiguration();
            const isChanged = isConfigurationChanged('fileSuffixes', oldConfig, newConfig) ||
                isConfigurationChanged('serverEmbedded.enable', oldConfig, newConfig) ||
                isConfigurationChanged('serverEmbedded.serverJar', oldConfig, newConfig);
            // NOTE:
            // To apply changed file suffixes directly, documentSelector of LanguageClient should be changed.
            // But it seems to be impossible, so VS Code needs to restart.
            if (isChanged) {
                oldConfig = newConfig;
                const reload = 'Reload Now';
                vscode.window.showInformationMessage('Restart VS Code before the new setting will take affect.', ...[reload])
                    .then(selection => {
                    if (selection === reload) {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
            }
        }
        function getFileSuffixes(configuration) {
            return configuration ? configuration.get('fileSuffixes', []) : [];
        }
        function getSupportedFileSuffixes(configuration) {
            return _.union(DEFAULT_FILE_SUFFIXES, getFileSuffixes(configuration));
        }
        const statusBar = new StatusBar_1.StatusBar();
        let serverRunning = false;
        vscode.window.onDidChangeActiveTextEditor(updateStatusBar);
        updateStatusBar(vscode.window.activeTextEditor);
        const configuration = oldConfig = getDeepScanConfiguration();
        let serverOptions;
        if (isEmbedded()) {
            serverOptions = () => runServer();
        }
        else {
            let serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
            let debugOptions = { execArgv: ["--nolazy", "--inspect=6004"] };
            serverOptions = {
                run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
                debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
            };
        }
        let defaultErrorHandler;
        let serverCalledProcessExit = false;
        let staticDocuments = _.map(getSupportedFileSuffixes(configuration), fileSuffix => ({ scheme: 'file', pattern: `**/*${fileSuffix}` }));
        let staticDocumentsForDisablingRules = _.filter(staticDocuments, ({ pattern }) => pattern !== '**/*.vue');
        let activeDecorations;
        let clientOptions = {
            documentSelector: staticDocuments,
            diagnosticCollectionName: DIAGNOSTIC_SOURCE_NAME,
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
        client = new vscode_languageclient_1.LanguageClient('DeepScan', serverOptions, clientOptions);
        defaultErrorHandler = client.createDefaultErrorHandler();
        const running = 'DeepScan server is running.';
        const stopped = 'DeepScan server stopped.';
        client.onDidChangeState((event) => {
            if (event.newState === vscode_languageclient_1.State.Running) {
                client.info(running);
                statusBar.setTooltip(running);
                serverRunning = true;
            }
            else {
                client.info(stopped);
                statusBar.setTooltip(stopped);
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
        const disposable = new vscode_languageclient_1.SettingMonitor(client, 'deepscan.enable').start();
        context.subscriptions.push(disposable);
        let rules = [];
        try {
            const rulesObj = JSON.parse(fs.readFileSync(context.asAbsolutePath(path.join('client', 'resources', 'deepscan-rules.json'))).toString());
            rules = rulesObj.rules;
        }
        catch (e) {
            vscode.window.showWarningMessage(`Can't read or parse rule definitions: ${e.message}`);
        }
        let style = '';
        try {
            style = fs.readFileSync(context.asAbsolutePath(path.join('client', 'resources', 'style.css'))).toString();
        }
        catch (e) {
            vscode.window.showWarningMessage(`Can't read a style: ${e.message}`);
        }
        // Register code actions
        const showRuleAction = new showRuleCodeActionProvider_1.default(context, { rules, style });
        context.subscriptions.push(vscode.languages.registerCodeActionsProvider(clientOptions.documentSelector, showRuleAction));
        const disableRulesAction = new disableRulesCodeActionProvider_1.default(context);
        context.subscriptions.push(vscode.languages.registerCodeActionsProvider(staticDocumentsForDisablingRules, disableRulesAction));
        context.subscriptions.push(registerEmbeddedCommand('deepscan.inspectProject', (command) => {
            const diagnostics = vscode.languages.getDiagnostics();
            client.info("Starting to analyze a project: " + vscode.workspace.rootPath);
            const successCallback = () => {
                client.info("Analysis completed");
            };
            utils_1.sendRequest(client, command, successCallback, [diagnostics]);
        }), registerEmbeddedCommand('deepscan.clearProject', (command) => {
            const diagnostics = vscode.languages.getDiagnostics();
            utils_1.sendRequest(client, command, null, [diagnostics]);
        }), vscode.commands.registerCommand(types_1.CommandIds.showOutput, () => { client.outputChannel.show(); }), statusBar.getStatusBarItem());
        vscode.workspace.onDidChangeConfiguration(changeConfiguration);
        yield checkSetting();
    });
}
function registerEmbeddedCommand(command, handler) {
    const embeddedCommand = vscode.commands.registerCommand(command, () => {
        if (!isEmbedded()) {
            const message = `This command ${command} is supported only in the embedded mode.`;
            utils_1.warn(client, message, true);
            return;
        }
        handler(command);
    });
    return embeddedCommand;
}
function checkSetting() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = getDeepScanConfiguration();
        if (isEmbedded()) {
            yield config.update('enable', true, false);
            return;
        }
        if (config.get('enable') === true) {
            return;
        }
        const shouldIgnore = config.get('ignoreConfirmWarning') === true;
        if (shouldIgnore) {
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
function isEmbedded() {
    return getDeepScanConfiguration().get("serverEmbedded.enable");
}
function runServer() {
    return new Promise((resolve, reject) => {
        const serverJar = getDeepScanConfiguration().get('serverEmbedded.serverJar');
        if (!fs.existsSync(serverJar)) {
            const message = 'JAR file for the DeepScan embedded server does not exist. Please set the right path and restart VS Code.';
            utils_1.warn(client, message, true);
            // TODO: reject() is the right way?
            return resolve({
                reader: process.stdin,
                writer: process.stdout
            });
        }
        const options = { cwd: vscode.workspace.rootPath };
        const params = [];
        params.push('-jar', serverJar);
        const child = child_process.spawn('java', params, options);
        child.on('error', function (e) {
            client.error('Cannot start the DeepScan server.', e);
            vscode.window.showErrorMessage(`Cannot start the DeepScan server: ${e.message}`);
        });
        console.log('Server spawned: ' + serverJar);
        // Make a wire with the language server.
        resolve({
            reader: child.stdout,
            writer: child.stdin
        });
        child.stderr.on('data', function (data) {
            console.log(data.toString());
        });
    });
}
//# sourceMappingURL=extension.js.map