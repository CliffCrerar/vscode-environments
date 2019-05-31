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
const vscode_debugadapter_1 = require("vscode-debugadapter");
const mi2_1 = require("./backend/mi2/mi2");
const utils_1 = require("./frontend/utils");
const backend_1 = require("./backend/backend");
const common_1 = require("./common");
const server_1 = require("./backend/server");
const mi_parse_1 = require("./backend/mi_parse");
const gdb_expansion_1 = require("./backend/gdb_expansion");
const portastic = require("portastic");
const os = require("os");
const path = require("path");
const fs = require("fs");
const hasbin = require("hasbin");
const crypto = require("crypto");
const timers_1 = require("timers");
const events_1 = require("events");
const jlink_1 = require("./jlink");
const openocd_1 = require("./openocd");
const stutil_1 = require("./stutil");
const pyocd_1 = require("./pyocd");
const bmp_1 = require("./bmp");
const pemicro_1 = require("./pemicro");
const qemu_1 = require("./qemu");
const symbols_1 = require("./backend/symbols");
const symbols_2 = require("./symbols");
const SERVER_TYPE_MAP = {
    jlink: jlink_1.JLinkServerController,
    openocd: openocd_1.OpenOCDServerController,
    stutil: stutil_1.STUtilServerController,
    pyocd: pyocd_1.PyOCDServerController,
    pe: pemicro_1.PEServerController,
    bmp: bmp_1.BMPServerController,
    qemu: qemu_1.QEMUServerController
};
class ExtendedVariable {
    constructor(name, options) {
        this.name = name;
        this.options = options;
    }
}
const GLOBAL_HANDLE_ID = 0xFE;
const STACK_HANDLES_START = 0x100;
const STACK_HANDLES_FINISH = 0xFFFF;
const STATIC_HANDLES_START = 0x010000;
const STATIC_HANDLES_FINISH = 0x01FFFF;
const VAR_HANDLES_START = 0x020000;
const COMMAND_MAP = (c) => c.startsWith('-') ? c.substring(1) : `interpreter-exec console "${c}"`;
class CustomStoppedEvent extends vscode_debugadapter_1.Event {
    constructor(reason, threadID) {
        super('custom-stop', { reason: reason, threadID: threadID });
    }
}
class CustomContinuedEvent extends vscode_debugadapter_1.Event {
    constructor(threadID, allThreads = true) {
        super('custom-continued', { threadID: threadID, allThreads: allThreads });
    }
}
class GDBDebugSession extends vscode_debugadapter_1.DebugSession {
    constructor(debuggerLinesStartAt1, isServer = false, threadID = 1) {
        super(debuggerLinesStartAt1, isServer);
        this.variableHandles = new vscode_debugadapter_1.Handles(VAR_HANDLES_START);
        this.variableHandlesReverse = {};
        this.forceDisassembly = false;
        this.activeEditorPath = null;
        this.currentThreadId = 0;
        this.stopped = false;
        this.stoppedReason = '';
        this.breakpointMap = new Map();
        this.fileExistsCache = new Map();
        this.onConfigDone = new events_1.EventEmitter();
    }
    initDebugger() {
        this.miDebugger.on('launcherror', this.launchError.bind(this));
        this.miDebugger.on('quit', this.quitEvent.bind(this));
        this.miDebugger.on('exited-normally', this.quitEvent.bind(this));
        this.miDebugger.on('stopped', this.stopEvent.bind(this));
        this.miDebugger.on('msg', this.handleMsg.bind(this));
        this.miDebugger.on('breakpoint', this.handleBreakpoint.bind(this));
        this.miDebugger.on('step-end', this.handleBreak.bind(this));
        this.miDebugger.on('step-out-end', this.handleBreak.bind(this));
        this.miDebugger.on('signal-stop', this.handlePause.bind(this));
        this.miDebugger.on('running', this.handleRunning.bind(this));
        this.miDebugger.on('thread-created', this.handleThreadCreated.bind(this));
        this.miDebugger.on('thread-exited', this.handleThreadExited.bind(this));
        this.miDebugger.on('thread-selected', this.handleThreadSelected.bind(this));
        this.sendEvent(new vscode_debugadapter_1.InitializedEvent());
    }
    initializeRequest(response, args) {
        response.body.supportsHitConditionalBreakpoints = true;
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsConditionalBreakpoints = true;
        response.body.supportsFunctionBreakpoints = true;
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsSetVariable = true;
        response.body.supportsRestartRequest = true;
        this.sendResponse(response);
    }
    launchRequest(response, args) {
        this.args = this.normalizeArguments(args);
        this.symbolTable = new symbols_1.SymbolTable(args.toolchainPath, args.executable);
        this.symbolTable.loadSymbols();
        this.breakpointMap = new Map();
        this.fileExistsCache = new Map();
        this.processLaunchAttachRequest(response, false);
    }
    attachRequest(response, args) {
        this.args = this.normalizeArguments(args);
        this.symbolTable = new symbols_1.SymbolTable(args.toolchainPath, args.executable);
        this.symbolTable.loadSymbols();
        this.breakpointMap = new Map();
        this.fileExistsCache = new Map();
        this.processLaunchAttachRequest(response, true);
    }
    normalizeArguments(args) {
        args.graphConfig = args.graphConfig || [];
        if (args.executable && !path.isAbsolute(args.executable)) {
            args.executable = path.normalize(path.join(args.cwd, args.executable));
        }
        if (args.svdFile && !path.isAbsolute(args.svdFile)) {
            args.svdFile = path.normalize(path.join(args.cwd, args.svdFile));
        }
        if (args.swoConfig && args.swoConfig.decoders) {
            args.swoConfig.decoders = args.swoConfig.decoders.map((dec) => {
                if (dec.type == "advanced" && dec.decoder && !path.isAbsolute(dec.decoder)) {
                    dec.decoder = path.normalize(path.join(args.cwd, dec.decoder));
                }
                return dec;
            });
        }
        return args;
    }
    processLaunchAttachRequest(response, attach) {
        if (!fs.existsSync(this.args.executable)) {
            this.sendErrorResponse(response, 103, `Unable to find executable file at ${this.args.executable}.`);
            return;
        }
        const ControllerClass = SERVER_TYPE_MAP[this.args.servertype];
        this.serverController = new ControllerClass();
        this.serverController.setArguments(this.args);
        this.serverController.on('event', this.serverControllerEvent.bind(this));
        this.quit = false;
        this.attached = false;
        this.started = false;
        this.crashed = false;
        this.debugReady = false;
        this.stopped = false;
        portastic.find({ min: 50000, max: 52000, retrieve: this.serverController.portsNeeded.length }, '0.0.0.0').then((ports) => {
            this.ports = {};
            this.serverController.portsNeeded.forEach((val, idx) => {
                this.ports[val] = ports[idx];
            });
            this.serverController.setPorts(this.ports);
            const executable = this.serverController.serverExecutable();
            const args = this.serverController.serverArguments();
            let gdbExePath = os.platform() !== 'win32' ? 'arm-none-eabi-gdb' : 'arm-none-eabi-gdb.exe';
            if (this.args.toolchainPath) {
                gdbExePath = path.normalize(path.join(this.args.toolchainPath, gdbExePath));
            }
            if (this.args.gdbpath) {
                gdbExePath = this.args.gdbpath;
            }
            // Check to see if gdb exists.
            if (path.isAbsolute(gdbExePath)) {
                if (fs.existsSync(gdbExePath) === false) {
                    this.sendErrorResponse(response, 103, `${this.serverController.name} GDB executable "${gdbExePath}" was not found.\nPlease configure "cortex-debug.armToolchainPath" correctly.`);
                    return;
                }
            }
            else {
                if (!hasbin.sync(gdbExePath.replace('.exe', ''))) {
                    this.sendErrorResponse(response, 103, `${this.serverController.name} GDB executable "${gdbExePath}" was not found.\nPlease configure "cortex-debug.armToolchainPath" correctly.`);
                    return;
                }
            }
            if (this.args.showDevDebugOutput) {
                this.handleMsg('log', `Please check OUTPUT tab (Adapter Output) for log of ${executable}` + '\n');
                const dbgMsg = `Launching server: "${executable}" ` + args.map((s) => { return `"${s}"`; }).join(' ') + '\n';
                this.handleMsg('log', dbgMsg);
            }
            this.server = new server_1.GDBServer(executable, args, this.serverController.initMatch());
            this.server.on('output', this.handleAdapterOutput.bind(this));
            this.server.on('quit', () => {
                if (this.started) {
                    this.quitEvent();
                }
                else {
                    this.sendErrorResponse(response, 103, `${this.serverController.name} GDB Server Quit Unexpectedly. See Adapter Output for more details.`);
                }
            });
            this.server.on('launcherror', (err) => {
                this.sendErrorResponse(response, 103, `Failed to launch ${this.serverController.name} GDB Server: ${err.toString()}`);
            });
            let timeout = timers_1.setTimeout(() => {
                this.server.exit();
                this.sendEvent(new common_1.TelemetryEvent('Error', 'Launching Server', `Failed to launch ${this.serverController.name} GDB Server: Timeout.`));
                this.sendErrorResponse(response, 103, `Failed to launch ${this.serverController.name} GDB Server: Timeout.`);
            }, 10000);
            this.serverController.serverLaunchStarted();
            this.server.init().then((started) => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                this.serverController.serverLaunchCompleted();
                let gdbargs = ['-q', '--interpreter=mi2'];
                gdbargs = gdbargs.concat(this.args.debuggerArgs || []);
                this.miDebugger = new mi2_1.MI2(gdbExePath, gdbargs);
                this.initDebugger();
                this.miDebugger.printCalls = !!this.args.showDevDebugOutput;
                this.miDebugger.debugOutput = !!this.args.showDevDebugOutput;
                const commands = [`interpreter-exec console "source ${this.args.extensionPath}/support/gdbsupport.init"`];
                commands.push(...this.serverController.initCommands());
                if (attach) {
                    commands.push(...this.args.preAttachCommands.map(COMMAND_MAP));
                    commands.push(...this.serverController.attachCommands());
                    commands.push(...this.args.postAttachCommands.map(COMMAND_MAP));
                }
                else {
                    commands.push(...this.args.preLaunchCommands.map(COMMAND_MAP));
                    commands.push(...this.serverController.launchCommands());
                    commands.push(...this.args.postLaunchCommands.map(COMMAND_MAP));
                }
                this.serverController.debuggerLaunchStarted();
                this.miDebugger.once('debug-ready', () => {
                    this.debugReady = true;
                });
                this.miDebugger.connect(this.args.cwd, this.args.executable, commands).then(() => {
                    this.started = true;
                    this.serverController.debuggerLaunchCompleted();
                    this.sendResponse(response);
                    const launchComplete = () => {
                        timers_1.setTimeout(() => {
                            this.stopped = true;
                            this.stoppedReason = 'start';
                            this.sendEvent(new common_1.StoppedEvent('start', this.currentThreadId, true));
                            this.sendEvent(new CustomStoppedEvent('start', this.currentThreadId));
                        }, 50);
                    };
                    if (this.args.runToMain) {
                        this.miDebugger.sendCommand('break-insert -t --function main').then(() => {
                            this.miDebugger.once('generic-stopped', launchComplete);
                            // To avoid race conditions between finishing configuration, we should stay
                            // in stopped mode. Or, we end up clobbering the stopped event that might come
                            // during setting of any additional breakpoints.
                            this.onConfigDone.once('done', () => {
                                this.miDebugger.sendCommand('exec-continue');
                            });
                        });
                    }
                    else {
                        launchComplete();
                    }
                }, (err) => {
                    this.sendErrorResponse(response, 103, `Failed to launch GDB: ${err.toString()}`);
                    this.sendEvent(new common_1.TelemetryEvent('Error', 'Launching GDB', err.toString()));
                });
            }, (error) => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                this.sendEvent(new common_1.TelemetryEvent('Error', 'Launching Server', `Failed to launch ${this.serverController.name} GDB Server: ${error.toString()}`));
                this.sendErrorResponse(response, 103, `Failed to launch ${this.serverController.name} GDB Server: ${error.toString()}`);
            });
        }, (err) => {
            this.sendEvent(new common_1.TelemetryEvent('Error', 'Launching Server', `Failed to find open ports: ${err.toString()}`));
            this.sendErrorResponse(response, 103, `Failed to find open ports: ${err.toString()}`);
        });
    }
    customRequest(command, response, args) {
        if (this.serverController.customRequest(command, response, args)) {
            this.sendResponse(response);
            return;
        }
        switch (command) {
            case 'set-force-disassembly':
                response.body = { success: true };
                this.forceDisassembly = args.force;
                if (this.stopped) {
                    this.activeEditorPath = null;
                    this.sendEvent(new vscode_debugadapter_1.ContinuedEvent(this.currentThreadId, true));
                    this.sendEvent(new common_1.StoppedEvent(this.stoppedReason, this.currentThreadId, true));
                }
                this.sendResponse(response);
                break;
            case 'load-function-symbols':
                response.body = { functionSymbols: this.symbolTable.getFunctionSymbols() };
                this.sendResponse(response);
                break;
            case 'set-active-editor':
                if (args.path !== this.activeEditorPath) {
                    this.activeEditorPath = args.path;
                    // if (this.stopped) {
                    //     this.sendEvent(new StoppedEvent(this.stoppedReason, this.currentThreadId, true));
                    // }
                }
                response.body = {};
                this.sendResponse(response);
                break;
            case 'get-arguments':
                response.body = this.args;
                this.sendResponse(response);
                break;
            case 'read-memory':
                this.readMemoryRequest(response, args['address'], args['length']);
                break;
            case 'write-memory':
                this.writeMemoryRequest(response, args['address'], args['data']);
                break;
            case 'read-registers':
                this.readRegistersRequest(response);
                break;
            case 'read-register-list':
                this.readRegisterListRequest(response);
                break;
            case 'disassemble':
                this.disassembleRequest(response, args);
                break;
            case 'execute-command':
                let cmd = args['command'];
                if (cmd.startsWith('-')) {
                    cmd = cmd.substring(1);
                }
                else {
                    cmd = `interpreter-exec console "${cmd}"`;
                }
                this.miDebugger.sendCommand(cmd).then((node) => {
                    response.body = node.resultRecords;
                    this.sendResponse(response);
                }, (error) => {
                    response.body = error;
                    this.sendErrorResponse(response, 110, 'Unable to execute command');
                });
                break;
            default:
                response.body = { error: 'Invalid command.' };
                this.sendResponse(response);
                break;
        }
    }
    disassembleRequest(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.function) {
                try {
                    const funcInfo = yield this.getDisassemblyForFunction(args.function, args.file);
                    response.body = {
                        instructions: funcInfo.instructions,
                        name: funcInfo.name,
                        file: funcInfo.file,
                        address: funcInfo.address,
                        length: funcInfo.length
                    };
                    this.sendResponse(response);
                }
                catch (e) {
                    this.sendErrorResponse(response, 1, `Unable to disassemble: ${e.toString()}`);
                }
                return;
            }
            else if (args.startAddress) {
                try {
                    let funcInfo = this.symbolTable.getFunctionAtAddress(args.startAddress);
                    if (funcInfo) {
                        funcInfo = yield this.getDisassemblyForFunction(funcInfo.name, funcInfo.file);
                        response.body = {
                            instructions: funcInfo.instructions,
                            name: funcInfo.name,
                            file: funcInfo.file,
                            address: funcInfo.address,
                            length: funcInfo.length
                        };
                        this.sendResponse(response);
                    }
                    else {
                        // tslint:disable-next-line:max-line-length
                        const instructions = yield this.getDisassemblyForAddresses(args.startAddress, args.length || 256);
                        response.body = { instructions: instructions };
                        this.sendResponse(response);
                    }
                }
                catch (e) {
                    this.sendErrorResponse(response, 1, `Unable to disassemble: ${e.toString()}`);
                }
                return;
            }
            else {
                this.sendErrorResponse(response, 1, 'Unable to disassemble; invalid parameters.');
            }
        });
    }
    getDisassemblyForFunction(functionName, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const symbol = this.symbolTable.getFunctionByName(functionName, file);
            if (!symbol) {
                throw new Error(`Unable to find function with name ${functionName}.`);
            }
            if (symbol.instructions) {
                return symbol;
            }
            const startAddress = symbol.address;
            const endAddress = symbol.address + symbol.length;
            // tslint:disable-next-line:max-line-length
            const result = yield this.miDebugger.sendCommand(`data-disassemble -s ${utils_1.hexFormat(startAddress, 8)} -e ${utils_1.hexFormat(endAddress, 8)} -- 2`);
            const rawInstructions = result.result('asm_insns');
            const instructions = rawInstructions.map((ri) => {
                const address = mi_parse_1.MINode.valueOf(ri, 'address');
                const functionName = mi_parse_1.MINode.valueOf(ri, 'func-name');
                const offset = parseInt(mi_parse_1.MINode.valueOf(ri, 'offset'));
                const inst = mi_parse_1.MINode.valueOf(ri, 'inst');
                const opcodes = mi_parse_1.MINode.valueOf(ri, 'opcodes');
                return {
                    address: address,
                    functionName: functionName,
                    offset: offset,
                    instruction: inst,
                    opcodes: opcodes
                };
            });
            symbol.instructions = instructions;
            return symbol;
        });
    }
    getDisassemblyForAddresses(startAddress, length) {
        return __awaiter(this, void 0, void 0, function* () {
            const endAddress = startAddress + length;
            // tslint:disable-next-line:max-line-length
            const result = yield this.miDebugger.sendCommand(`data-disassemble -s ${utils_1.hexFormat(startAddress, 8)} -e ${utils_1.hexFormat(endAddress, 8)} -- 2`);
            const rawInstructions = result.result('asm_insns');
            const instructions = rawInstructions.map((ri) => {
                const address = mi_parse_1.MINode.valueOf(ri, 'address');
                const functionName = mi_parse_1.MINode.valueOf(ri, 'func-name');
                const offset = parseInt(mi_parse_1.MINode.valueOf(ri, 'offset'));
                const inst = mi_parse_1.MINode.valueOf(ri, 'inst');
                const opcodes = mi_parse_1.MINode.valueOf(ri, 'opcodes');
                return {
                    address: address,
                    functionName: functionName,
                    offset: offset,
                    instruction: inst,
                    opcodes: opcodes
                };
            });
            return instructions;
        });
    }
    readMemoryRequest(response, startAddress, length) {
        const address = utils_1.hexFormat(startAddress, 8);
        this.miDebugger.sendCommand(`data-read-memory-bytes ${address} ${length}`).then((node) => {
            const startAddress = node.resultRecords.results[0][1][0][0][1];
            const endAddress = node.resultRecords.results[0][1][0][2][1];
            const data = node.resultRecords.results[0][1][0][3][1];
            const bytes = data.match(/[0-9a-f]{2}/g).map((b) => parseInt(b, 16));
            response.body = {
                startAddress: startAddress,
                endAddress: endAddress,
                bytes: bytes
            };
            this.sendResponse(response);
        }, (error) => {
            response.body = { error: error };
            this.sendErrorResponse(response, 114, `Unable to read memory: ${error.toString()}`);
            this.sendEvent(new common_1.TelemetryEvent('Error', 'Reading Memory', `${startAddress.toString(16)}-${length.toString(16)}`));
        });
    }
    writeMemoryRequest(response, startAddress, data) {
        const address = utils_1.hexFormat(startAddress, 8);
        this.miDebugger.sendCommand(`data-write-memory-bytes ${address} ${data}`).then((node) => {
            this.sendResponse(response);
        }, (error) => {
            response.body = { error: error };
            this.sendErrorResponse(response, 114, `Unable to write memory: ${error.toString()}`);
            this.sendEvent(new common_1.TelemetryEvent('Error', 'Writing Memory', `${startAddress.toString(16)}-${data.length.toString(16)}`));
        });
    }
    readRegistersRequest(response) {
        this.miDebugger.sendCommand('data-list-register-values x').then((node) => {
            if (node.resultRecords.resultClass === 'done') {
                const rv = node.resultRecords.results[0][1];
                response.body = rv.map((n) => {
                    const val = {};
                    n.forEach((x) => {
                        val[x[0]] = x[1];
                    });
                    return val;
                });
            }
            else {
                response.body = {
                    error: 'Unable to parse response'
                };
            }
            this.sendResponse(response);
        }, (error) => {
            response.body = { error: error };
            this.sendErrorResponse(response, 115, `Unable to read registers: ${error.toString()}`);
            this.sendEvent(new common_1.TelemetryEvent('Error', 'Reading Registers', ''));
        });
    }
    readRegisterListRequest(response) {
        this.miDebugger.sendCommand('data-list-register-names').then((node) => {
            if (node.resultRecords.resultClass === 'done') {
                let registerNames;
                node.resultRecords.results.forEach((rr) => {
                    if (rr[0] === 'register-names') {
                        registerNames = rr[1];
                    }
                });
                response.body = registerNames;
            }
            else {
                response.body = { error: node.resultRecords.results };
            }
            this.sendResponse(response);
        }, (error) => {
            response.body = { error: error };
            this.sendErrorResponse(response, 116, `Unable to read register list: ${error.toString()}`);
            this.sendEvent(new common_1.TelemetryEvent('Error', 'Reading Register List', ''));
        });
    }
    disconnectRequest(response, args) {
        if (this.miDebugger) {
            if (this.attached) {
                this.miDebugger.detach();
            }
            else {
                this.miDebugger.stop();
            }
        }
        if (this.commandServer) {
            this.commandServer.close();
            this.commandServer = undefined;
        }
        try {
            this.server.exit();
        }
        catch (e) { }
        this.sendResponse(response);
    }
    restartRequest(response, args) {
        const restartProcessing = () => {
            const commands = [];
            commands.push(...this.args.preRestartCommands.map(COMMAND_MAP));
            commands.push(...this.serverController.restartCommands());
            commands.push(...this.args.postRestartCommands.map(COMMAND_MAP));
            this.miDebugger.restart(commands).then((done) => {
                this.sendResponse(response);
                timers_1.setTimeout(() => {
                    this.stopped = true;
                    this.stoppedReason = 'restart';
                    this.sendEvent(new vscode_debugadapter_1.ContinuedEvent(this.currentThreadId, true));
                    this.sendEvent(new common_1.StoppedEvent('restart', this.currentThreadId, true));
                }, 50);
            }, (msg) => {
                this.sendErrorResponse(response, 6, `Could not restart: ${msg}`);
            });
        };
        if (this.stopped) {
            restartProcessing();
        }
        else {
            this.miDebugger.once('generic-stopped', restartProcessing);
            this.miDebugger.sendCommand('exec-interrupt');
        }
    }
    handleAdapterOutput(output) {
        this.sendEvent(new common_1.AdapterOutputEvent(output, 'out'));
    }
    serverControllerEvent(event) {
        this.sendEvent(event);
    }
    handleMsg(type, msg) {
        if (type === 'target') {
            type = 'stdout';
        }
        if (type === 'log') {
            type = 'stderr';
        }
        this.sendEvent(new vscode_debugadapter_1.OutputEvent(msg, type));
    }
    handleRunning(info) {
        this.stopped = false;
        this.sendEvent(new vscode_debugadapter_1.ContinuedEvent(this.currentThreadId, true));
        this.sendEvent(new CustomContinuedEvent(this.currentThreadId, true));
    }
    handleBreakpoint(info) {
        this.stopped = true;
        this.stoppedReason = 'breakpoint';
        this.sendEvent(new common_1.StoppedEvent('breakpoint', this.currentThreadId, true));
        this.sendEvent(new CustomStoppedEvent('breakpoint', this.currentThreadId));
    }
    handleBreak(info) {
        this.stopped = true;
        this.stoppedReason = 'step';
        this.sendEvent(new common_1.StoppedEvent('step', this.currentThreadId, true));
        this.sendEvent(new CustomStoppedEvent('step', this.currentThreadId));
    }
    handlePause(info) {
        this.stopped = true;
        this.stoppedReason = 'user request';
        this.sendEvent(new common_1.StoppedEvent('user request', this.currentThreadId, true));
        this.sendEvent(new CustomStoppedEvent('user request', this.currentThreadId));
    }
    handleThreadCreated(info) {
        this.sendEvent(new vscode_debugadapter_1.ThreadEvent('started', info.threadId));
    }
    handleThreadExited(info) {
        this.sendEvent(new vscode_debugadapter_1.ThreadEvent('exited', info.threadId));
    }
    handleThreadSelected(info) {
        this.currentThreadId = info.threadId;
        this.sendEvent(new vscode_debugadapter_1.ThreadEvent('selected', info.threadId));
    }
    stopEvent(info) {
        if (!this.started) {
            this.crashed = true;
        }
        if (!this.quit) {
            this.stopped = true;
            this.stoppedReason = 'exception';
            this.sendEvent(new common_1.StoppedEvent('exception', this.currentThreadId, true));
            this.sendEvent(new CustomStoppedEvent('exception', this.currentThreadId));
        }
    }
    quitEvent() {
        this.quit = true;
        this.sendEvent(new vscode_debugadapter_1.TerminatedEvent());
    }
    launchError(err) {
        this.handleMsg('stderr', 'Could not start debugger process, does the program exist in filesystem?\n');
        this.handleMsg('stderr', err.toString() + '\n');
        this.quitEvent();
    }
    setVariableRequest(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let name = args.name;
                if (args.variablesReference >= VAR_HANDLES_START) {
                    const parent = this.variableHandles.get(args.variablesReference);
                    name = `${parent.name}.${name}`;
                }
                const res = yield this.miDebugger.varAssign(name, args.value);
                response.body = {
                    value: res.result('value')
                };
                this.sendResponse(response);
            }
            catch (err) {
                this.sendErrorResponse(response, 11, `Could not continue: ${err}`);
            }
        });
    }
    setFunctionBreakPointsRequest(response, args) {
        const createBreakpoints = (shouldContinue) => __awaiter(this, void 0, void 0, function* () {
            const all = [];
            args.breakpoints.forEach((brk) => {
                all.push(this.miDebugger.addBreakPoint({ raw: brk.name, condition: brk.condition, countCondition: brk.hitCondition }));
            });
            try {
                let brkpoints = yield Promise.all(all);
                const finalBrks = [];
                brkpoints.forEach((brkp) => {
                    if (brkp[0]) {
                        finalBrks.push({ line: brkp[1].line });
                    }
                });
                response.body = {
                    breakpoints: finalBrks
                };
                this.sendResponse(response);
            }
            catch (msg) {
                this.sendErrorResponse(response, 10, msg.toString());
            }
            if (shouldContinue) {
                yield this.miDebugger.sendCommand('exec-continue');
            }
        });
        const process = () => __awaiter(this, void 0, void 0, function* () {
            if (this.stopped) {
                yield createBreakpoints(false);
            }
            else {
                this.miDebugger.sendCommand('exec-interrupt');
                this.miDebugger.once('generic-stopped', () => { createBreakpoints(true); });
            }
        });
        if (this.debugReady) {
            process();
        }
        else {
            this.miDebugger.once('debug-ready', process);
        }
    }
    setBreakPointsRequest(response, args) {
        const createBreakpoints = (shouldContinue) => __awaiter(this, void 0, void 0, function* () {
            this.debugReady = true;
            const currentBreakpoints = (this.breakpointMap.get(args.source.path) || []).map((bp) => bp.number);
            try {
                yield this.miDebugger.removeBreakpoints(currentBreakpoints);
                this.breakpointMap.set(args.source.path, []);
                const all = [];
                const sourcepath = decodeURIComponent(args.source.path);
                if (sourcepath.startsWith('disassembly:/')) {
                    let sidx = 13;
                    if (sourcepath.startsWith('disassembly:///')) {
                        sidx = 15;
                    }
                    const path = sourcepath.substring(sidx, sourcepath.length - 6); // Account for protocol and extension
                    const parts = path.split('::');
                    let func;
                    let file;
                    if (parts.length === 2) {
                        func = parts[1];
                        file = parts[0];
                    }
                    else {
                        func = parts[0];
                    }
                    const symbol = yield this.getDisassemblyForFunction(func, file);
                    args.breakpoints.forEach((brk) => {
                        if (brk.line <= symbol.instructions.length) {
                            const line = symbol.instructions[brk.line - 1];
                            all.push(this.miDebugger.addBreakPoint({
                                file: args.source.path,
                                line: brk.line,
                                condition: brk.condition,
                                countCondition: brk.hitCondition,
                                raw: line.address
                            }));
                        }
                    });
                }
                else {
                    args.breakpoints.forEach((brk) => {
                        all.push(this.miDebugger.addBreakPoint({
                            file: args.source.path,
                            line: brk.line,
                            condition: brk.condition,
                            countCondition: brk.hitCondition
                        }));
                    });
                }
                const brkpoints = yield Promise.all(all);
                const finalBrks = brkpoints.filter((bp) => bp !== null);
                response.body = {
                    breakpoints: finalBrks.map((bp) => {
                        return {
                            line: bp.line,
                            id: bp.number,
                            verified: true
                        };
                    })
                };
                this.breakpointMap.set(args.source.path, finalBrks);
                this.sendResponse(response);
            }
            catch (msg) {
                this.sendErrorResponse(response, 9, msg.toString());
            }
            if (shouldContinue) {
                yield this.miDebugger.sendCommand('exec-continue');
            }
        });
        const process = () => __awaiter(this, void 0, void 0, function* () {
            if (this.stopped) {
                yield createBreakpoints(false);
            }
            else {
                yield this.miDebugger.sendCommand('exec-interrupt');
                this.miDebugger.once('generic-stopped', () => { createBreakpoints(true); });
            }
        });
        if (this.debugReady) {
            process();
        }
        else {
            this.miDebugger.once('debug-ready', process);
        }
    }
    threadsRequest(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.stopped) {
                response.body = { threads: [] };
                this.sendResponse(response);
            }
            try {
                const threadIdNode = yield this.miDebugger.sendCommand('thread-list-ids');
                const threadIds = threadIdNode.result('thread-ids').map((ti) => parseInt(ti[1]));
                const currentThread = threadIdNode.result('current-thread-id');
                if (!currentThread) {
                    yield this.miDebugger.sendCommand(`thread-select ${threadIds[0]}`);
                    this.currentThreadId = threadIds[0];
                }
                else {
                    this.currentThreadId = parseInt(currentThread);
                }
                const nodes = yield Promise.all(threadIds.map((id) => this.miDebugger.sendCommand(`thread-info ${id}`)));
                const threads = nodes.map((node) => {
                    let th = node.result('threads');
                    if (th.length === 1) {
                        th = th[0];
                        const id = parseInt(mi_parse_1.MINode.valueOf(th, 'id'));
                        const tid = mi_parse_1.MINode.valueOf(th, 'target-id');
                        const details = mi_parse_1.MINode.valueOf(th, 'details');
                        return new vscode_debugadapter_1.Thread(id, details || tid);
                    }
                    else {
                        return null;
                    }
                }).filter((t) => t !== null);
                response.body = {
                    threads: threads
                };
                this.sendResponse(response);
            }
            catch (e) {
                this.sendErrorResponse(response, 1, `Unable to get thread information: ${e}`);
            }
        });
    }
    stackTraceRequest(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stack = yield this.miDebugger.getStack(args.threadId, args.startFrame, args.levels);
                const ret = [];
                for (const element of stack) {
                    const stackId = (args.threadId << 8 | (element.level & 0xFF)) & 0xFFFF;
                    const file = element.file;
                    let disassemble = this.forceDisassembly || !file;
                    if (!disassemble) {
                        disassemble = !(yield this.checkFileExists(file));
                    }
                    if (!disassemble && this.activeEditorPath && this.activeEditorPath.startsWith('disassembly:///')) {
                        const symbolInfo = this.symbolTable.getFunctionByName(element.function, element.fileName);
                        let url;
                        if (symbolInfo) {
                            if (symbolInfo.scope !== symbols_2.SymbolScope.Global) {
                                url = `disassembly:///${symbolInfo.file}::${symbolInfo.name}.cdasm`;
                            }
                            else {
                                url = `disassembly:///${symbolInfo.name}.cdasm`;
                            }
                            if (url === this.activeEditorPath) {
                                disassemble = true;
                            }
                        }
                    }
                    try {
                        if (disassemble) {
                            const symbolInfo = yield this.getDisassemblyForFunction(element.function, element.fileName);
                            let line = -1;
                            symbolInfo.instructions.forEach((inst, idx) => {
                                if (inst.address === element.address) {
                                    line = idx + 1;
                                }
                            });
                            if (line !== -1) {
                                let fname;
                                let url;
                                if (symbolInfo.scope !== symbols_2.SymbolScope.Global) {
                                    fname = `${symbolInfo.file}::${symbolInfo.name}.cdasm`;
                                    url = `disassembly:///${symbolInfo.file}::${symbolInfo.name}.cdasm`;
                                }
                                else {
                                    fname = `${symbolInfo.name}.cdasm`;
                                    url = `disassembly:///${symbolInfo.name}.cdasm`;
                                }
                                ret.push(new vscode_debugadapter_1.StackFrame(stackId, `${element.function}@${element.address}`, new vscode_debugadapter_1.Source(fname, url), line, 0));
                            }
                            else {
                                ret.push(new vscode_debugadapter_1.StackFrame(stackId, element.function + '@' + element.address, null, element.line, 0));
                            }
                        }
                        else {
                            ret.push(new vscode_debugadapter_1.StackFrame(stackId, element.function + '@' + element.address, new vscode_debugadapter_1.Source(element.fileName, file), element.line, 0));
                        }
                    }
                    catch (e) {
                        ret.push(new vscode_debugadapter_1.StackFrame(stackId, element.function + '@' + element.address, null, element.line, 0));
                    }
                }
                response.body = {
                    stackFrames: ret
                };
                this.sendResponse(response);
            }
            catch (err) {
                this.sendErrorResponse(response, 12, `Failed to get Stack Trace: ${err.toString()}`);
            }
        });
    }
    configurationDoneRequest(response, args) {
        this.sendResponse(response);
        this.onConfigDone.emit('done');
    }
    scopesRequest(response, args) {
        const scopes = new Array();
        scopes.push(new vscode_debugadapter_1.Scope('Local', parseInt(args.frameId), false));
        scopes.push(new vscode_debugadapter_1.Scope('Global', GLOBAL_HANDLE_ID, false));
        scopes.push(new vscode_debugadapter_1.Scope('Static', STATIC_HANDLES_START + parseInt(args.frameId), false));
        response.body = {
            scopes: scopes
        };
        this.sendResponse(response);
    }
    globalVariablesRequest(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const symbolInfo = this.symbolTable.getGlobalVariables();
            const globals = [];
            try {
                for (const symbol of symbolInfo) {
                    const varObjName = `global_var_${symbol.name}`;
                    let varObj;
                    try {
                        const changes = yield this.miDebugger.varUpdate(varObjName);
                        const changelist = changes.result('changelist');
                        changelist.forEach((change) => {
                            const name = mi_parse_1.MINode.valueOf(change, 'name');
                            const vId = this.variableHandlesReverse[name];
                            const v = this.variableHandles.get(vId);
                            v.applyChanges(change);
                        });
                        const varId = this.variableHandlesReverse[varObjName];
                        varObj = this.variableHandles.get(varId);
                    }
                    catch (err) {
                        if (err instanceof backend_1.MIError && err.message === 'Variable object not found') {
                            varObj = yield this.miDebugger.varCreate(symbol.name, varObjName);
                            const varId = this.findOrCreateVariable(varObj);
                            varObj.exp = symbol.name;
                            varObj.id = varId;
                        }
                        else {
                            throw err;
                        }
                    }
                    globals.push(varObj.toProtocolVariable());
                }
                response.body = { variables: globals };
                this.sendResponse(response);
            }
            catch (err) {
                this.sendErrorResponse(response, 1, `Could not get global variable information: ${err}`);
            }
        });
    }
    staticVariablesRequest(threadId, frameId, response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const statics = [];
            try {
                const frame = yield this.miDebugger.getFrame(threadId, frameId);
                const file = frame.fileName;
                const staticSymbols = this.symbolTable.getStaticVariables(file);
                for (const symbol of staticSymbols) {
                    const varObjName = `${file}_static_var_${symbol.name}`;
                    let varObj;
                    try {
                        const changes = yield this.miDebugger.varUpdate(varObjName);
                        const changelist = changes.result('changelist');
                        changelist.forEach((change) => {
                            const name = mi_parse_1.MINode.valueOf(change, 'name');
                            const vId = this.variableHandlesReverse[name];
                            const v = this.variableHandles.get(vId);
                            v.applyChanges(change);
                        });
                        const varId = this.variableHandlesReverse[varObjName];
                        varObj = this.variableHandles.get(varId);
                    }
                    catch (err) {
                        if (err instanceof backend_1.MIError && err.message === 'Variable object not found') {
                            varObj = yield this.miDebugger.varCreate(symbol.name, varObjName);
                            const varId = this.findOrCreateVariable(varObj);
                            varObj.exp = symbol.name;
                            varObj.id = varId;
                        }
                        else {
                            throw err;
                        }
                    }
                    statics.push(varObj.toProtocolVariable());
                }
                response.body = { variables: statics };
                this.sendResponse(response);
            }
            catch (err) {
                this.sendErrorResponse(response, 1, `Could not get global variable information: ${err}`);
            }
        });
    }
    createVariable(arg, options) {
        if (options) {
            return this.variableHandles.create(new ExtendedVariable(arg, options));
        }
        else {
            return this.variableHandles.create(arg);
        }
    }
    findOrCreateVariable(varObj) {
        let id;
        if (this.variableHandlesReverse.hasOwnProperty(varObj.name)) {
            id = this.variableHandlesReverse[varObj.name];
        }
        else {
            id = this.createVariable(varObj);
            this.variableHandlesReverse[varObj.name] = id;
        }
        return varObj.isCompound() ? id : 0;
    }
    stackVariablesRequest(threadId, frameId, response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const variables = [];
            let stack;
            try {
                stack = yield this.miDebugger.getStackVariables(threadId, frameId);
                for (const variable of stack) {
                    try {
                        const varObjName = `var_${variable.name}`;
                        let varObj;
                        try {
                            const changes = yield this.miDebugger.varUpdate(varObjName);
                            const changelist = changes.result('changelist');
                            changelist.forEach((change) => {
                                const name = mi_parse_1.MINode.valueOf(change, 'name');
                                const vId = this.variableHandlesReverse[name];
                                const v = this.variableHandles.get(vId);
                                v.applyChanges(change);
                            });
                            const varId = this.variableHandlesReverse[varObjName];
                            varObj = this.variableHandles.get(varId);
                        }
                        catch (err) {
                            if (err instanceof backend_1.MIError && err.message === 'Variable object not found') {
                                varObj = yield this.miDebugger.varCreate(variable.name, varObjName);
                                const varId = this.findOrCreateVariable(varObj);
                                varObj.exp = variable.name;
                                varObj.id = varId;
                            }
                            else {
                                throw err;
                            }
                        }
                        variables.push(varObj.toProtocolVariable());
                    }
                    catch (err) {
                        variables.push({
                            name: variable.name,
                            value: `<${err}>`,
                            variablesReference: 0
                        });
                    }
                }
                response.body = {
                    variables: variables
                };
                this.sendResponse(response);
            }
            catch (err) {
                this.sendErrorResponse(response, 1, `Could not expand variable: ${err}`);
            }
        });
    }
    variableMembersRequest(id, response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            // Variable members
            let variable;
            try {
                variable = yield this.miDebugger.evalExpression(JSON.stringify(id));
                try {
                    let expanded = gdb_expansion_1.expandValue(this.createVariable.bind(this), variable.result('value'), id, variable);
                    if (!expanded) {
                        this.sendErrorResponse(response, 2, 'Could not expand variable');
                    }
                    else {
                        if (typeof expanded[0] === 'string') {
                            expanded = [
                                {
                                    name: '<value>',
                                    value: prettyStringArray(expanded),
                                    variablesReference: 0
                                }
                            ];
                        }
                        response.body = {
                            variables: expanded
                        };
                        this.sendResponse(response);
                    }
                }
                catch (e) {
                    this.sendErrorResponse(response, 2, `Could not expand variable: ${e}`);
                }
            }
            catch (err) {
                this.sendErrorResponse(response, 1, `Could not expand variable: ${err}`);
            }
        });
    }
    variablesRequest(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            if (args.variablesReference === GLOBAL_HANDLE_ID) {
                return this.globalVariablesRequest(response, args);
            }
            else if (args.variablesReference >= STATIC_HANDLES_START && args.variablesReference <= STATIC_HANDLES_FINISH) {
                const frameId = args.variablesReference & 0xFF;
                const threadId = (args.variablesReference & 0xFF00) >>> 8;
                return this.staticVariablesRequest(threadId, frameId, response, args);
            }
            else if (args.variablesReference >= STACK_HANDLES_START && args.variablesReference < STATIC_HANDLES_START) {
                const frameId = args.variablesReference & 0xFF;
                const threadId = (args.variablesReference & 0xFF00) >>> 8;
                return this.stackVariablesRequest(threadId, frameId, response, args);
            }
            else {
                id = this.variableHandles.get(args.variablesReference);
                if (typeof id === 'string') {
                    return this.variableMembersRequest(id, response, args);
                }
                else if (typeof id === 'object') {
                    if (id instanceof backend_1.VariableObject) {
                        let pvar = id;
                        const variables = [];
                        // Variable members
                        let children;
                        try {
                            children = yield this.miDebugger.varListChildren(id.name);
                            const vars = children.map((child) => {
                                const varId = this.findOrCreateVariable(child);
                                child.id = varId;
                                if (/^\d+$/.test(child.exp)) {
                                    child.fullExp = `${pvar.fullExp || pvar.exp}[${child.exp}]`;
                                }
                                else {
                                    child.fullExp = `${pvar.fullExp || pvar.exp}.${child.exp}`;
                                }
                                return child.toProtocolVariable();
                            });
                            response.body = {
                                variables: vars
                            };
                            this.sendResponse(response);
                        }
                        catch (err) {
                            this.sendErrorResponse(response, 1, `Could not expand variable: ${err}`);
                        }
                    }
                    else if (id instanceof ExtendedVariable) {
                        const variables = [];
                        const varReq = id;
                        if (varReq.options.arg) {
                            const strArr = [];
                            let argsPart = true;
                            let arrIndex = 0;
                            const submit = () => {
                                response.body = {
                                    variables: strArr
                                };
                                this.sendResponse(response);
                            };
                            const addOne = () => __awaiter(this, void 0, void 0, function* () {
                                const variable = yield this.miDebugger.evalExpression(JSON.stringify(`${varReq.name}+${arrIndex})`));
                                try {
                                    const expanded = gdb_expansion_1.expandValue(this.createVariable.bind(this), variable.result('value'), varReq.name, variable);
                                    if (!expanded) {
                                        this.sendErrorResponse(response, 15, 'Could not expand variable');
                                    }
                                    else {
                                        if (typeof expanded === 'string') {
                                            if (expanded === '<nullptr>') {
                                                if (argsPart) {
                                                    argsPart = false;
                                                }
                                                else {
                                                    return submit();
                                                }
                                            }
                                            else if (expanded[0] !== '"') {
                                                strArr.push({
                                                    name: '[err]',
                                                    value: expanded,
                                                    variablesReference: 0
                                                });
                                                return submit();
                                            }
                                            strArr.push({
                                                name: `[${(arrIndex++)}]`,
                                                value: expanded,
                                                variablesReference: 0
                                            });
                                            addOne();
                                        }
                                        else {
                                            strArr.push({
                                                name: '[err]',
                                                value: expanded,
                                                variablesReference: 0
                                            });
                                            submit();
                                        }
                                    }
                                }
                                catch (e) {
                                    this.sendErrorResponse(response, 14, `Could not expand variable: ${e}`);
                                }
                            });
                            addOne();
                        }
                        else {
                            this.sendErrorResponse(response, 13, `Unimplemented variable request options: ${JSON.stringify(varReq.options)}`);
                        }
                    }
                    else {
                        response.body = {
                            variables: id
                        };
                        this.sendResponse(response);
                    }
                }
                else {
                    response.body = {
                        variables: []
                    };
                    this.sendResponse(response);
                }
            }
        });
    }
    pauseRequest(response, args) {
        this.miDebugger.interrupt(args.threadId).then((done) => {
            this.sendResponse(response);
        }, (msg) => {
            this.sendErrorResponse(response, 3, `Could not pause: ${msg}`);
        });
    }
    continueRequest(response, args) {
        this.miDebugger.continue(args.threadId).then((done) => {
            response.body = { allThreadsContinued: true };
            this.sendResponse(response);
        }, (msg) => {
            this.sendErrorResponse(response, 2, `Could not continue: ${msg}`);
        });
    }
    stepInRequest(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let assemblyMode = this.forceDisassembly;
                if (!assemblyMode) {
                    const frame = yield this.miDebugger.getFrame(args.threadId, 0);
                    assemblyMode = !(yield this.checkFileExists(frame.file));
                    if (this.activeEditorPath && this.activeEditorPath.startsWith('disassembly:///')) {
                        const symbolInfo = this.symbolTable.getFunctionByName(frame.function, frame.fileName);
                        let url;
                        if (symbolInfo.scope !== symbols_2.SymbolScope.Global) {
                            url = `disassembly:///${symbolInfo.file}::${symbolInfo.name}.cdasm`;
                        }
                        else {
                            url = `disassembly:///${symbolInfo.name}.cdasm`;
                        }
                        if (url === this.activeEditorPath) {
                            assemblyMode = true;
                        }
                    }
                }
                const done = yield this.miDebugger.step(args.threadId, assemblyMode);
                this.sendResponse(response);
            }
            catch (msg) {
                this.sendErrorResponse(response, 6, `Could not step over: ${msg}`);
            }
        });
    }
    stepOutRequest(response, args) {
        this.miDebugger.stepOut(args.threadId).then((done) => {
            this.sendResponse(response);
        }, (msg) => {
            this.sendErrorResponse(response, 5, `Could not step out: ${msg}`);
        });
    }
    nextRequest(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let assemblyMode = this.forceDisassembly;
                if (!assemblyMode) {
                    const frame = yield this.miDebugger.getFrame(args.threadId, 0);
                    assemblyMode = !(yield this.checkFileExists(frame.file));
                    if (this.activeEditorPath && this.activeEditorPath.startsWith('disassembly:///')) {
                        const symbolInfo = this.symbolTable.getFunctionByName(frame.function, frame.fileName);
                        let url;
                        if (symbolInfo.scope !== symbols_2.SymbolScope.Global) {
                            url = `disassembly:///${symbolInfo.file}::${symbolInfo.name}.cdasm`;
                        }
                        else {
                            url = `disassembly:///${symbolInfo.name}.cdasm`;
                        }
                        if (url === this.activeEditorPath) {
                            assemblyMode = true;
                        }
                    }
                }
                const done = yield this.miDebugger.next(args.threadId, assemblyMode);
                this.sendResponse(response);
            }
            catch (msg) {
                this.sendErrorResponse(response, 6, `Could not step over: ${msg}`);
            }
        });
    }
    checkFileExists(name) {
        if (!name) {
            return Promise.resolve(false);
        }
        if (this.fileExistsCache.has(name)) { // Check cache
            return Promise.resolve(this.fileExistsCache.get(name));
        }
        return new Promise((resolve, reject) => {
            fs.exists(name, (exists) => {
                this.fileExistsCache.set(name, exists);
                resolve(exists);
            });
        });
    }
    evaluateRequest(response, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const createVariable = (arg, options) => {
                if (options) {
                    return this.variableHandles.create(new ExtendedVariable(arg, options));
                }
                else {
                    return this.variableHandles.create(arg);
                }
            };
            const findOrCreateVariable = (varObj) => {
                let id;
                if (this.variableHandlesReverse.hasOwnProperty(varObj.name)) {
                    id = this.variableHandlesReverse[varObj.name];
                }
                else {
                    id = createVariable(varObj);
                    this.variableHandlesReverse[varObj.name] = id;
                }
                return varObj.isCompound() ? id : 0;
            };
            if (args.context === 'watch') {
                try {
                    const exp = args.expression;
                    let hasher = crypto.createHash('sha256');
                    hasher.update(exp);
                    const watchName = hasher.digest('hex');
                    const varObjName = `watch_${watchName}`;
                    let varObj;
                    try {
                        const changes = yield this.miDebugger.varUpdate(varObjName);
                        const changelist = changes.result('changelist');
                        changelist.forEach((change) => {
                            const name = mi_parse_1.MINode.valueOf(change, 'name');
                            const vId = this.variableHandlesReverse[name];
                            const v = this.variableHandles.get(vId);
                            v.applyChanges(change);
                        });
                        const varId = this.variableHandlesReverse[varObjName];
                        varObj = this.variableHandles.get(varId);
                        response.body = {
                            result: varObj.value,
                            variablesReference: varObj.id
                        };
                    }
                    catch (err) {
                        if (err instanceof backend_1.MIError && err.message === 'Variable object not found') {
                            varObj = yield this.miDebugger.varCreate(exp, varObjName);
                            const varId = findOrCreateVariable(varObj);
                            varObj.exp = exp;
                            varObj.id = varId;
                            response.body = {
                                result: varObj.value,
                                variablesReference: varObj.id
                            };
                        }
                        else {
                            throw err;
                        }
                    }
                    this.sendResponse(response);
                }
                catch (err) {
                    response.body = {
                        result: `<${err.toString()}>`,
                        variablesReference: 0
                    };
                    this.sendErrorResponse(response, 7, err.toString());
                }
            }
            else if (args.context === 'hover') {
                try {
                    const res = yield this.miDebugger.evalExpression(args.expression);
                    response.body = {
                        variablesReference: 0,
                        result: res.result('value')
                    };
                    this.sendResponse(response);
                }
                catch (e) {
                    this.sendErrorResponse(response, 7, e.toString());
                }
            }
            else {
                this.miDebugger.sendUserInput(args.expression).then((output) => {
                    if (typeof output === 'undefined') {
                        response.body = {
                            result: '',
                            variablesReference: 0
                        };
                    }
                    else {
                        response.body = {
                            result: JSON.stringify(output),
                            variablesReference: 0
                        };
                    }
                    this.sendResponse(response);
                }, (msg) => {
                    this.sendErrorResponse(response, 8, msg.toString());
                });
            }
        });
    }
}
exports.GDBDebugSession = GDBDebugSession;
function prettyStringArray(strings) {
    if (typeof strings === 'object') {
        if (strings.length !== undefined) {
            return strings.join(', ');
        }
        else {
            return JSON.stringify(strings);
        }
    }
    else {
        return strings;
    }
}
vscode_debugadapter_1.DebugSession.run(GDBDebugSession);
//# sourceMappingURL=gdb.js.map