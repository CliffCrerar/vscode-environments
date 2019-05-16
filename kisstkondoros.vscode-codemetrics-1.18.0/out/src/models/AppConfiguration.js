"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const VSCodeMetricsConfiguration_1 = require("../metrics/common/VSCodeMetricsConfiguration");
class AppConfiguration {
    constructor() {
        this.toggleCodeMetricsForArrowFunctionsExecuted = false;
        this.codeMetricsForArrowFunctionsToggled = true;
        this.codeMetricsDisplayed = true;
    }
    get extensionName() {
        return "codemetrics";
    }
    getCodeMetricsSettings(resource) {
        var settings = vscode_1.workspace.getConfiguration(this.extensionName, resource);
        const resultingSettings = VSCodeMetricsConfiguration_1.getInitialVSCodeMetricsConfiguration();
        for (var propertyName in resultingSettings) {
            var property = "nodeconfiguration." + propertyName;
            if (settings.has(property)) {
                resultingSettings[propertyName] = settings.get(property);
                continue;
            }
            property = "basics." + propertyName;
            if (settings.has(property)) {
                resultingSettings[propertyName] = settings.get(property);
                continue;
            }
        }
        for (var propertyName in resultingSettings.LuaStatementMetricsConfiguration) {
            property = "luaconfiguration." + propertyName;
            if (settings.has(property)) {
                resultingSettings.LuaStatementMetricsConfiguration[propertyName] = settings.get(property);
                continue;
            }
        }
        if (this.toggleCodeMetricsForArrowFunctionsExecuted) {
            resultingSettings.MetricsForArrowFunctionsToggled = this.codeMetricsForArrowFunctionsToggled;
        }
        return resultingSettings;
    }
}
exports.AppConfiguration = AppConfiguration;
//# sourceMappingURL=AppConfiguration.js.map