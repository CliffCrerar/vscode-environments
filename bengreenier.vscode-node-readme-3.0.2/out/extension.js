'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const request = require("request");
const local_1 = require("./providers/local");
const npm_1 = require("./providers/npm");
const remote_1 = require("./providers/remote");
const ShowReadme = require("./commands/showReadme");
const commandPrefix = "nodeReadme";
function activate(context) {
    context.subscriptions.push(...[
        vscode.workspace.registerTextDocumentContentProvider(npm_1.NpmProvider.SchemaType, new npm_1.NpmProvider()),
        vscode.workspace.registerTextDocumentContentProvider(local_1.LocalProvider.SchemaType, new local_1.LocalProvider()),
        vscode.workspace.registerTextDocumentContentProvider(remote_1.RemoteProvider.SchemaType, new remote_1.RemoteProvider()),
        vscode.commands.registerCommand(`${commandPrefix}.${ShowReadme.id}`, ShowReadme.command)
    ]);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
class TestHookManager {
    constructor() {
        this.testMode = false;
        this.logData = [];
        this.errData = [];
        this.httpImpl = (reqOpts, cb) => {
            request(reqOpts, function (err, res, body) {
                if (err || res.statusCode !== 200) {
                    err = err || {};
                    err.status = res.statusCode;
                    return cb(err);
                }
                else {
                    cb(null, res);
                }
            });
        };
    }
    log(data) {
        if (this.testMode) {
            this.logData.push(data);
        }
    }
    err(data) {
        if (this.testMode) {
            this.errData.push(data);
        }
    }
    clear() {
        this.logData = [];
    }
    getHttpImpl() {
        return this.httpImpl;
    }
    setHttpImpl(impl) {
        if (this.testMode) {
            this.httpImpl = impl;
        }
    }
}
exports.TestHook = new TestHookManager();
//# sourceMappingURL=extension.js.map