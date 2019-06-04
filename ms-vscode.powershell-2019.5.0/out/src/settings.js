/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils = require("./utils");
var CodeFormattingPreset;
(function (CodeFormattingPreset) {
    CodeFormattingPreset[CodeFormattingPreset["Custom"] = 0] = "Custom";
    CodeFormattingPreset[CodeFormattingPreset["Allman"] = 1] = "Allman";
    CodeFormattingPreset[CodeFormattingPreset["OTBS"] = 2] = "OTBS";
    CodeFormattingPreset[CodeFormattingPreset["Stroustrup"] = 3] = "Stroustrup";
})(CodeFormattingPreset || (CodeFormattingPreset = {}));
var PipelineIndentationStyle;
(function (PipelineIndentationStyle) {
    PipelineIndentationStyle[PipelineIndentationStyle["IncreaseIndentationForFirstPipeline"] = 0] = "IncreaseIndentationForFirstPipeline";
    PipelineIndentationStyle[PipelineIndentationStyle["IncreaseIndentationAfterEveryPipeline"] = 1] = "IncreaseIndentationAfterEveryPipeline";
    PipelineIndentationStyle[PipelineIndentationStyle["NoIndentation"] = 2] = "NoIndentation";
})(PipelineIndentationStyle || (PipelineIndentationStyle = {}));
var HelpCompletion;
(function (HelpCompletion) {
    HelpCompletion["Disabled"] = "Disabled";
    HelpCompletion["BlockComment"] = "BlockComment";
    HelpCompletion["LineComment"] = "LineComment";
})(HelpCompletion = exports.HelpCompletion || (exports.HelpCompletion = {}));
function load() {
    const configuration = vscode.workspace.getConfiguration(utils.PowerShellLanguageId);
    const defaultBugReportingSettings = {
        project: "https://github.com/PowerShell/vscode-powershell",
    };
    const defaultScriptAnalysisSettings = {
        enable: true,
        settingsPath: "",
    };
    const defaultDebuggingSettings = {
        createTemporaryIntegratedConsole: false,
    };
    const defaultDeveloperSettings = {
        featureFlags: [],
        powerShellExePath: undefined,
        bundledModulesPath: "../../../PowerShellEditorServices/module",
        editorServicesLogLevel: "Normal",
        editorServicesWaitForDebugger: false,
        powerShellExeIsWindowsDevBuild: false,
    };
    const defaultCodeFoldingSettings = {
        enable: true,
        showLastLine: false,
    };
    const defaultCodeFormattingSettings = {
        preset: CodeFormattingPreset.Custom,
        openBraceOnSameLine: true,
        newLineAfterOpenBrace: true,
        newLineAfterCloseBrace: true,
        pipelineIndentationStyle: PipelineIndentationStyle.NoIndentation,
        whitespaceBeforeOpenBrace: true,
        whitespaceBeforeOpenParen: true,
        whitespaceAroundOperator: true,
        whitespaceAfterSeparator: true,
        WhitespaceInsideBrace: true,
        WhitespaceAroundPipe: true,
        ignoreOneLineBlock: true,
        alignPropertyValuePairs: true,
        useCorrectCasing: false,
    };
    const defaultIntegratedConsoleSettings = {
        showOnStartup: true,
        focusConsoleOnExecute: true,
    };
    return {
        startAutomatically: configuration.get("startAutomatically", true),
        powerShellAdditionalExePaths: configuration.get("powerShellAdditionalExePaths", undefined),
        powerShellDefaultVersion: configuration.get("powerShellDefaultVersion", undefined),
        powerShellExePath: configuration.get("powerShellExePath", undefined),
        bundledModulesPath: "../../modules",
        useX86Host: configuration.get("useX86Host", false),
        enableProfileLoading: configuration.get("enableProfileLoading", false),
        helpCompletion: configuration.get("helpCompletion", HelpCompletion.BlockComment),
        scriptAnalysis: configuration.get("scriptAnalysis", defaultScriptAnalysisSettings),
        debugging: configuration.get("debugging", defaultDebuggingSettings),
        developer: getWorkspaceSettingsWithDefaults(configuration, "developer", defaultDeveloperSettings),
        codeFolding: configuration.get("codeFolding", defaultCodeFoldingSettings),
        codeFormatting: configuration.get("codeFormatting", defaultCodeFormattingSettings),
        integratedConsole: configuration.get("integratedConsole", defaultIntegratedConsoleSettings),
        bugReporting: configuration.get("bugReporting", defaultBugReportingSettings),
    };
}
exports.load = load;
function change(settingName, newValue, global = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const configuration = vscode.workspace.getConfiguration(utils.PowerShellLanguageId);
        yield configuration.update(settingName, newValue, global);
    });
}
exports.change = change;
function getWorkspaceSettingsWithDefaults(workspaceConfiguration, settingName, defaultSettings) {
    const importedSettings = workspaceConfiguration.get(settingName, defaultSettings);
    for (const setting in importedSettings) {
        if (importedSettings[setting]) {
            defaultSettings[setting] = importedSettings[setting];
        }
    }
    return defaultSettings;
}
//# sourceMappingURL=settings.js.map