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
const text_editor_1 = require("../vscode/text-editor");
const telemetry_reporter_locator_1 = require("../telemetry/telemetry-reporter-locator");
class CommandWrapper {
    constructor(command, logger) {
        this.command = command;
        this.logger = logger;
    }
    execute(vsEditor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.onInvoke();
                const editor = vsEditor && new text_editor_1.default(vsEditor);
                return yield this.command.execute(editor);
            }
            catch (e) {
                this.onError();
                this.logger.error(e.stack);
            }
        });
    }
    onInvoke() { }
    onError() { }
}
class ManualTriggerCommand extends CommandWrapper {
    constructor(name, command, logger) {
        super(command, logger);
        this.name = name;
        this.telemetryReporter = telemetry_reporter_locator_1.TelemetryReporterLocator.getReporter();
    }
    onInvoke() {
        this.telemetryReporter.logCommandTrigger(this.name);
    }
    onError() {
        this.telemetryReporter.logCommandErrored(this.name);
    }
}
exports.ManualTriggerCommand = ManualTriggerCommand;
class AutoTriggerCommand extends CommandWrapper {
}
exports.AutoTriggerCommand = AutoTriggerCommand;
//# sourceMappingURL=command.js.map