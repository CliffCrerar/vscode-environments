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
const semver = require("semver");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const main_1 = require("vscode-jsonrpc/lib/main");
const dotnet = require("./utils/dotnet");
const executables = require("./utils/executables");
const package_reference_completion_1 = require("./providers/package-reference-completion");
const notifications_1 = require("./notifications");
const commands_1 = require("./commands");
const internal_commands_1 = require("./internal-commands");
const settings_1 = require("./settings");
let configuration;
let languageClient;
let statusBarItem;
let outputChannel;
const featureFlags = new Set();
const languageServerEnvironment = Object.assign({}, process.env);
const projectDocumentSelector = [
    { language: 'xml', pattern: '**/*.*proj' },
    { language: 'xml', pattern: '**/*.props' },
    { language: 'xml', pattern: '**/*.targets' },
    { language: 'xml', pattern: '**/*.tasks' },
    { language: 'msbuild', pattern: '**/*.*' }
];
/**
 * Called when the extension is activated.
 *
 * @param context The extension context.
 */
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const progressOptions = {
            location: vscode.ProgressLocation.Window
        };
        yield vscode.window.withProgress(progressOptions, (progress) => __awaiter(this, void 0, void 0, function* () {
            progress.report({
                message: 'Initialising MSBuild project tools...'
            });
            yield loadConfiguration();
            const enableLanguageService = !configuration.language.useClassicProvider;
            let couldEnableLanguageService = false;
            if (enableLanguageService) {
                const dotnetVersion = yield dotnet.getVersion();
                couldEnableLanguageService = dotnetVersion && semver.gte(dotnetVersion, '2.0.0');
            }
            if (enableLanguageService && couldEnableLanguageService) {
                yield createLanguageClient(context);
                context.subscriptions.push(handleExpressionAutoClose());
                commands_1.registerCommands(context, statusBarItem);
                internal_commands_1.registerInternalCommands(context);
            }
            else {
                yield createClassicCompletionProvider(context, couldEnableLanguageService);
                outputChannel.appendLine('Classic completion provider is now enabled.');
            }
        }));
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((args) => __awaiter(this, void 0, void 0, function* () {
            yield loadConfiguration();
            if (languageClient) {
                if (configuration.logging.trace) {
                    languageClient.trace = main_1.Trace.Verbose;
                }
                else {
                    languageClient.trace = main_1.Trace.Off;
                }
            }
        })));
    });
}
exports.activate = activate;
/**
 * Called when the extension is deactivated.
 */
function deactivate() {
    // Nothing to clean up.
}
exports.deactivate = deactivate;
/**
 * Load extension configuration from the workspace.
 */
function loadConfiguration() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        configuration = workspaceConfiguration.get('msbuildProjectTools');
        yield settings_1.upgradeConfigurationSchema(configuration);
        configuration = settings_1.readVSCodeSettings(configuration);
        featureFlags.clear();
        if (configuration.experimentalFeatures) {
            configuration.experimentalFeatures.forEach(featureFlag => featureFlags.add(featureFlag));
        }
    });
}
/**
 * Create the classic completion provider for PackageReferences.
 *
 * @param context The current extension context.
 * @param canEnableLanguageService Could the language service be enabled if we wanted to?
 */
function createClassicCompletionProvider(context, canEnableLanguageService) {
    return __awaiter(this, void 0, void 0, function* () {
        outputChannel = vscode.window.createOutputChannel('MSBuild Project Tools');
        if (!configuration.language.useClassicProvider && !canEnableLanguageService)
            outputChannel.appendLine('Cannot enable the MSBuild language service because .NET Core >= 2.0.0 was not found on the system path.');
        outputChannel.appendLine('MSBuild language service disabled; using the classic completion provider.');
        const nugetEndPointURLs = yield package_reference_completion_1.getNuGetV3AutoCompleteEndPoints();
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider(projectDocumentSelector, new package_reference_completion_1.PackageReferenceCompletionProvider(nugetEndPointURLs[0], // For now, just default to using the primary.
        configuration.nuget.newestVersionsFirst)));
    });
}
/**
 * Create the MSBuild language client.
 *
 * @param context The current extension context.
 * @returns A promise that resolves to the language client.
 */
function createLanguageClient(context) {
    return __awaiter(this, void 0, void 0, function* () {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 50);
        context.subscriptions.push(statusBarItem);
        statusBarItem.text = '$(check) MSBuild Project';
        statusBarItem.tooltip = 'MSBuild Project Tools';
        statusBarItem.hide();
        const clientOptions = {
            synchronize: {
                configurationSection: 'msbuildProjectTools'
            },
            diagnosticCollectionName: 'MSBuild Project',
            errorHandler: {
                error: (error, message, count) => {
                    console.log(message);
                    console.log(error);
                    return vscode_languageclient_1.ErrorAction.Continue;
                },
                closed: () => vscode_languageclient_1.CloseAction.Restart
            },
            revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never
        };
        languageServerEnvironment['MSBUILD_PROJECT_TOOLS_DIR'] = context.extensionPath;
        const seqLoggingSettings = configuration.logging.seq;
        if (seqLoggingSettings && seqLoggingSettings.url) {
            languageServerEnvironment['MSBUILD_PROJECT_TOOLS_SEQ_URL'] = seqLoggingSettings.url;
            languageServerEnvironment['MSBUILD_PROJECT_TOOLS_SEQ_API_KEY'] = seqLoggingSettings.apiKey;
        }
        if (configuration.logging.file) {
            languageServerEnvironment['MSBUILD_PROJECT_TOOLS_LOG_FILE'] = configuration.logging.file;
        }
        if (configuration.logging.level === 'Verbose') {
            languageServerEnvironment['MSBUILD_PROJECT_TOOLS_VERBOSE_LOGGING'] = '1';
        }
        const dotNetExecutable = yield executables.find('dotnet');
        const serverAssembly = context.asAbsolutePath('out/language-server/MSBuildProjectTools.LanguageServer.Host.dll');
        const serverOptions = {
            command: dotNetExecutable,
            args: [serverAssembly],
            options: {
                env: languageServerEnvironment
            }
        };
        languageClient = new vscode_languageclient_1.LanguageClient('MSBuild Project Tools', serverOptions, clientOptions);
        if (configuration.logging.trace) {
            languageClient.trace = main_1.Trace.Verbose;
        }
        else {
            languageClient.trace = main_1.Trace.Off;
        }
        notifications_1.handleBusyNotifications(languageClient, statusBarItem);
        outputChannel = languageClient.outputChannel;
        outputChannel.appendLine('Starting MSBuild language service...');
        context.subscriptions.push(languageClient.start());
        yield languageClient.onReady();
        outputChannel.appendLine('MSBuild language service is running.');
    });
}
/**
 * Handle document-change events to automatically insert a closing parenthesis for common MSBuild expressions.
 */
function handleExpressionAutoClose() {
    return vscode.workspace.onDidChangeTextDocument((args) => __awaiter(this, void 0, void 0, function* () {
        if (!vscode.languages.match(projectDocumentSelector, args.document))
            return;
        if (!featureFlags.has('expressions'))
            return;
        if (args.contentChanges.length !== 1)
            return; // Completion doesn't make sense with multiple cursors.
        const contentChange = args.contentChanges[0];
        if (isOriginPosition(contentChange.range.start))
            return; // We're at the start of the document; no previous character to check.
        if (contentChange.text === '(') {
            // Select the previous character and the one they just typed.
            const range = contentChange.range.with(contentChange.range.start.translate(0, -1), contentChange.range.end.translate(0, 1));
            const openExpression = args.document.getText(range);
            switch (openExpression) {
                case '$(': // Eval open
                case '@(': // Item group open
                case '%(':// Item metadata open
                    {
                        break;
                    }
                default:
                    {
                        return;
                    }
            }
            // Replace open expression with a closed one.
            const closedExpression = openExpression + ')';
            yield vscode.window.activeTextEditor.edit(edit => edit.replace(range, closedExpression));
            // Move between the parentheses and trigger completion.
            yield vscode.commands.executeCommand('msbuildProjectTools.internal.moveAndSuggest', 'left', // moveTo
            'character', // moveBy
            1 // moveCount
            );
        }
    }));
}
/**
 * Determine whether the specified {@link vscode.Position} represents the origin position.
 *
 * @param position The {@link vscode.Position} to examine.
 */
function isOriginPosition(position) {
    return position.line === 0 && position.character === 0;
}
//# sourceMappingURL=extension.js.map