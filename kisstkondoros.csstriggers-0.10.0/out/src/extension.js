"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const vscode_languageclient_1 = require("vscode-languageclient");
const triggerdecorator_1 = require("./triggerdecorator");
const protocol_1 = require("./common/protocol");
function activate(context) {
    let serverModule = context.asAbsolutePath(path.join("out", "src", "server", "server.js"));
    let debugOptions = { execArgv: ["--nolazy", "--inspect=6004"] };
    let serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    var output = vscode.window.createOutputChannel("CssTrigger");
    let error = (error, message) => {
        output.appendLine(message.jsonrpc);
        return undefined;
    };
    let clientOptions = {
        documentSelector: ["*"],
        errorHandler: {
            error: error,
            closed: () => {
                return undefined;
            }
        },
        synchronize: {
            configurationSection: "csstriggers"
        }
    };
    let client = new vscode_languageclient_1.LanguageClient("CssTrigger parser", serverOptions, clientOptions);
    let disposable = client.start();
    context.subscriptions.push(disposable);
    let symbolUpdater = (document, visibleLines, token) => {
        return client
            .onReady()
            .then(() => {
            return client.sendRequest(protocol_1.CssTriggerSymbolRequestType, {
                uri: document.uri.toString(),
                visibleLines: visibleLines,
                fileName: document.fileName
            }, token);
        })
            .catch(() => {
            console.warn("Connection was not yet ready when requesting symbols for css trigger.");
            return {
                symbols: []
            };
        });
    };
    triggerdecorator_1.activateColorDecorations(symbolUpdater, context, client);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map