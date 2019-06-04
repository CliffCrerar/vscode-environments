"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
let shell = require('shelljs');
class Config {
    constructor() {
        this._CONFIG_MAIN_KEY = 'postman';
        this._CONFIG_SHOW_INFO_MESSAGE = 'showRunInfoMessage';
        this._CONFIG_SHOW_RESULTS_IN_NEW_DOCUMENT = 'showResultsInNewDocument';
        this._CONFIG_SHOW_OUTPUT_AUTOMATICALLY = 'showOutputAutomatically';
        this._CONFIG_SHOW_PROGRESS_IN_TOOLBAR = 'showProgressInToolbar';
        this._CONFIG_TEST_DEFAULT_DELAY = 'testDefaultDelay';
        this._CONFIG_TEST_DEFAULT_ITERATIONS = 'testDefaultIterations';
        this._workspaceConfiguration = null;
    }
    get WorkspaceConfiguration() {
        if (!this._workspaceConfiguration) {
            this._workspaceConfiguration = vscode.workspace.getConfiguration(this._CONFIG_MAIN_KEY);
        }
        return this._workspaceConfiguration;
    }
    get showRunInfoMessage() {
        return this.WorkspaceConfiguration.get(this._CONFIG_SHOW_INFO_MESSAGE, true);
    }
    get showResultsInNewDocument() {
        return this.WorkspaceConfiguration.get(this._CONFIG_SHOW_RESULTS_IN_NEW_DOCUMENT, true);
    }
    get showOutputAutomatically() {
        return this.WorkspaceConfiguration.get(this._CONFIG_SHOW_OUTPUT_AUTOMATICALLY, true);
    }
    get showProgressInToolbar() {
        return this.WorkspaceConfiguration.get(this._CONFIG_SHOW_PROGRESS_IN_TOOLBAR, true);
    }
    get resultsFileDir() {
        return shell.tempdir();
    }
    get testDefaultDelay() {
        return this.WorkspaceConfiguration.get(this._CONFIG_TEST_DEFAULT_DELAY, 0);
    }
    get testDefaultIterations() {
        return this.WorkspaceConfiguration.get(this._CONFIG_TEST_DEFAULT_ITERATIONS, 1);
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map