"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVsTelemetryReporterCreator = (useRealReporter) => {
    if (useRealReporter) {
        // Cannot import at the top-level as it causes error during unit test
        const VsTelemetryReporter = require('vscode-extension-telemetry').default;
        return (id, version, telemetryKey) => new VsTelemetryReporter(id, version, telemetryKey);
    }
    else {
        return () => new NullVsTelemetryReporter();
    }
};
class NullVsTelemetryReporter {
    sendTelemetryEvent(_eventName, _properties, _measurements) {
    }
    dispose() {
        return Promise.resolve();
    }
}
exports.NullVsTelemetryReporter = NullVsTelemetryReporter;
//# sourceMappingURL=vscode-telemetry-reporter.js.map