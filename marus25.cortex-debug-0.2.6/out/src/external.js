"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class ExternalServerController extends events_1.EventEmitter {
    constructor() {
        super();
        this.name = 'External';
        this.portsNeeded = [];
    }
    setPorts(ports) {
        this.ports = ports;
    }
    setArguments(args) {
        this.args = args;
    }
    customRequest(command, response, args) {
        return false;
    }
    initCommands() {
        const commands = [
            'interpreter-exec console "set mem inaccessible-by-default off"'
        ];
        return commands;
    }
    launchCommands() {
        const commands = [
            'target-download',
            'interpreter-exec console "monitor reset"',
            'enable-pretty-printing'
        ];
        return commands;
    }
    attachCommands() {
        const commands = [
            'enable-pretty-printing'
        ];
        return commands;
    }
    restartCommands() {
        const commands = [
            'interpreter-exec console "monitor reset"'
        ];
        return commands;
    }
    serverExecutable() {
        return null;
    }
    serverArguments() {
        return [];
    }
    initMatch() {
        return null;
    }
    serverLaunchStarted() { }
    serverLaunchCompleted() { }
    debuggerLaunchStarted() { }
    debuggerLaunchCompleted() { }
}
exports.ExternalServerController = ExternalServerController;
//# sourceMappingURL=external.js.map