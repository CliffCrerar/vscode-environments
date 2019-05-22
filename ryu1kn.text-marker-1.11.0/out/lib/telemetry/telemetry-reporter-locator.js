"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const telemetry_reporter_1 = require("./telemetry-reporter");
const getTelemetryConfig = (packageJsonPath) => {
    const { publisher, name, version, telemetryKey } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return {
        id: `${publisher}.${name}`,
        version,
        telemetryKey
    };
};
class TelemetryReporterLocator {
    static load(packageConfPath, reporterCreator) {
        const config = getTelemetryConfig(packageConfPath);
        const vsTelemetryReporter = reporterCreator(config.id, config.version, config.telemetryKey);
        TelemetryReporterLocator.telemetryReporter = new telemetry_reporter_1.TelemetryReporter(vsTelemetryReporter);
    }
    static getReporter() {
        return TelemetryReporterLocator.telemetryReporter;
    }
}
exports.TelemetryReporterLocator = TelemetryReporterLocator;
//# sourceMappingURL=telemetry-reporter-locator.js.map