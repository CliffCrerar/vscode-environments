"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChildProcess = require("child_process");
const os = require("os");
const events_1 = require("events");
const timers_1 = require("timers");
class GDBServer extends events_1.EventEmitter {
    constructor(application, args, initMatch) {
        super();
        this.application = application;
        this.args = args;
        this.initMatch = initMatch;
        this.outBuffer = '';
        this.errBuffer = '';
    }
    init() {
        return new Promise((resolve, reject) => {
            if (this.application !== null) {
                this.initResolve = resolve;
                this.initReject = reject;
                this.process = ChildProcess.spawn(this.application, this.args, {});
                this.process.stdout.on('data', this.onStdout.bind(this));
                this.process.stderr.on('data', this.onStderr.bind(this));
                this.process.on('exit', this.onExit.bind(this));
                this.process.on('error', this.onError.bind(this));
                if (this.application.indexOf('st-util') !== -1 && os.platform() === 'win32') {
                    // For some reason we are not able to capture the st-util output on Windows
                    // For now assume that it will launch properly within 1/2 second and resolve the init
                    timers_1.setTimeout(() => {
                        if (this.initResolve) {
                            this.initResolve(true);
                            this.initReject = null;
                            this.initResolve = null;
                        }
                    }, 500);
                }
                if (this.initMatch == null) {
                    // If there is no init match string (e.g. QEMU) assume launch in 1/2 second and resolve
                    timers_1.setTimeout(() => {
                        if (this.initResolve) {
                            this.initResolve(true);
                            this.initReject = null;
                            this.initResolve = null;
                        }
                    }, 1000);
                }
            }
            else { // For servers like BMP that are always running directly on the probe
                resolve();
            }
        });
    }
    exit() {
        if (this.process) {
            this.process.kill();
        }
    }
    onExit(code, signal) {
        this.emit('exit', code, signal);
    }
    onError(err) {
        if (this.initReject) {
            this.initReject(err);
            this.initReject = null;
            this.initResolve = null;
        }
        this.emit('launcherror', err);
    }
    onStdout(data) {
        if (typeof data === 'string') {
            this.outBuffer += data;
        }
        else {
            this.outBuffer += data.toString('utf8');
        }
        if (this.initResolve && this.initMatch.test(this.outBuffer)) {
            this.initResolve(true);
            this.initResolve = null;
            this.initReject = null;
        }
        const end = this.outBuffer.lastIndexOf('\n');
        if (end !== -1) {
            this.emit('output', this.outBuffer.substring(0, end));
            this.outBuffer = this.outBuffer.substring(end + 1);
        }
    }
    onStderr(data) {
        if (typeof data === 'string') {
            this.errBuffer += data;
        }
        else {
            this.errBuffer += data.toString('utf8');
        }
        if (this.initResolve && this.initMatch.test(this.errBuffer)) {
            this.initResolve(true);
            this.initResolve = null;
            this.initReject = null;
        }
        const end = this.errBuffer.lastIndexOf('\n');
        if (end !== -1) {
            this.emit('output', this.errBuffer.substring(0, end));
            this.errBuffer = this.errBuffer.substring(end + 1);
        }
    }
}
exports.GDBServer = GDBServer;
//# sourceMappingURL=server.js.map