"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const app_integrator_1 = require("./lib/app-integrator");
const vscode_telemetry_reporter_1 = require("./lib/telemetry/vscode-telemetry-reporter");
const path_1 = require("path");
const workspace_1 = require("./lib/vscode/workspace");
const telemetry_reporter_locator_1 = require("./lib/telemetry/telemetry-reporter-locator");
const workspace = new workspace_1.default(vscode.workspace);
const reporterCreator = vscode_telemetry_reporter_1.getVsTelemetryReporterCreator(workspace.get('enableTelemetry'));
const packageJsonPath = path_1.join(__dirname, '..', 'package.json');
telemetry_reporter_locator_1.TelemetryReporterLocator.load(packageJsonPath, reporterCreator);
const telemetryReporter = telemetry_reporter_locator_1.TelemetryReporterLocator.getReporter();
exports.activate = (context) => {
    app_integrator_1.default.create(vscode, console).integrate(context);
    context.subscriptions.push(telemetryReporter);
};
exports.deactivate = () => {
    telemetryReporter.dispose();
};
//# sourceMappingURL=extension.js.map