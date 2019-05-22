"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TelemetryReporter {
    constructor(reporter) {
        this.reporter = reporter;
    }
    logCommandTrigger(commandName) {
        this.reporter.sendTelemetryEvent('commandTriggered', { commandName });
    }
    logCommandErrored(commandName) {
        this.reporter.sendTelemetryEvent('commandErrored', { commandName });
    }
    logHighlightUpdated(updateType) {
        this.reporter.sendTelemetryEvent('highlightUpdated', { updateType });
    }
    dispose() {
        return this.reporter.dispose();
    }
}
exports.TelemetryReporter = TelemetryReporter;
//# sourceMappingURL=telemetry-reporter.js.map