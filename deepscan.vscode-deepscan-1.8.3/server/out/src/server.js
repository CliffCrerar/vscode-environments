/* --------------------------------------------------------------------------------------------
 * Copyright (c) S-Core Co., Ltd. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const vscode_languageserver_1 = require("vscode-languageserver");
var path = require('path');
var request = require('request').defaults({ jar: true });
var Status;
(function (Status) {
    Status[Status["none"] = 0] = "none";
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["fail"] = 3] = "fail";
})(Status || (Status = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = new vscode_languageserver_1.NotificationType('deepscan/status');
})(StatusNotification || (StatusNotification = {}));
var CommandIds;
(function (CommandIds) {
    CommandIds.inspectCode = 'deepscan.tryInspect';
})(CommandIds || (CommandIds = {}));
function convertSeverity(impact) {
    switch (impact) {
        case 'Low':
            return vscode_languageserver_1.DiagnosticSeverity.Warning;
        case 'Medium':
            return vscode_languageserver_1.DiagnosticSeverity.Error;
        case 'High':
            return vscode_languageserver_1.DiagnosticSeverity.Error;
        default:
            return vscode_languageserver_1.DiagnosticSeverity.Information;
    }
}
const exitCalled = new vscode_languageserver_1.NotificationType('deepscan/exitCalled');
const nodeExit = process.exit;
process.exit = ((code) => {
    let stack = new Error('stack');
    connection.sendNotification(exitCalled, [code ? code : 0, stack.stack]);
    setTimeout(() => {
        nodeExit(code);
    }, 1000);
});
let connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
let settings = null;
let documents = new vscode_languageserver_1.TextDocuments();
let supportedFileSuffixes = null;
// options
let deepscanServer = undefined;
let proxyServer = undefined;
let userAgent = undefined;
let ignoreRules = null;
let DEFAULT_FILE_SUFFIXES = null;
let fileSuffixes = null;
let httpProxy = _.pick(process.env, ['http_proxy']).http_proxy;
function supportsLanguage(document) {
    return _.includes(supportedFileSuffixes, path.extname(document.uri));
}
// The documents manager listen for text document create, change
// and close on the connection
documents.listen(connection);
documents.onDidOpen((event) => {
    if (!supportsLanguage(event.document)) {
        return;
    }
    inspect(event.document);
});
// A text document has been saved. Validate the document according the run setting.
documents.onDidSave((event) => {
    inspect(event.document);
});
documents.onDidClose((event) => {
    if (!supportsLanguage(event.document)) {
        return;
    }
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});
function getServerUrl(url) {
    return detachSlash(url);
}
function initializeSupportedFileSuffixes() {
    supportedFileSuffixes = _.union(DEFAULT_FILE_SUFFIXES, fileSuffixes);
}
connection.onInitialize((params) => {
    let initOptions = params.initializationOptions;
    deepscanServer = getServerUrl(initOptions.server);
    proxyServer = initOptions.proxy;
    DEFAULT_FILE_SUFFIXES = initOptions.DEFAULT_FILE_SUFFIXES;
    fileSuffixes = initOptions.fileSuffixes;
    initializeSupportedFileSuffixes();
    userAgent = initOptions.userAgent;
    connection.console.info(`Server: ${deepscanServer} (${userAgent})`);
    return {
        capabilities: {
            textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.None,
            executeCommandProvider: {
                commands: [CommandIds.inspectCode]
            },
            // Tell the client that the server support code complete
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});
// Triggered only for the change of user settings
connection.onDidChangeConfiguration((params) => {
    connection.console.info(`onDidChangeConfiguration ${params})`);
    settings = params.settings || {};
    settings.deepscan = settings.deepscan || {};
    let changed = false;
    if (settings.deepscan.server) {
        let oldServer = deepscanServer;
        deepscanServer = getServerUrl(settings.deepscan.server);
        if (deepscanServer !== oldServer) {
            changed = true;
        }
    }
    let oldProxyServer = proxyServer;
    proxyServer = settings.deepscan.proxy;
    if (proxyServer !== oldProxyServer) {
        changed = true;
    }
    let oldRules = ignoreRules;
    ignoreRules = settings.deepscan.ignoreRules;
    if (!_.isEqual(ignoreRules, oldRules)) {
        changed = true;
    }
    let oldFileSuffixes = fileSuffixes;
    fileSuffixes = settings.deepscan.fileSuffixes;
    if (!_.isEqual(fileSuffixes, oldFileSuffixes)) {
        changed = true;
        initializeSupportedFileSuffixes();
    }
    if (changed) {
        connection.console.info(`Configuration changed: ${deepscanServer} (proxy: ${proxyServer}, fileSuffixes: ${fileSuffixes})`);
        // Reinspect any open text documents
        documents.all().forEach(inspect);
    }
});
connection.onCompletion((_textDocumentPosition) => {
    return [{
            label: 'deepscan-disable',
            kind: vscode_languageserver_1.CompletionItemKind.Text,
            data: 1
        }, {
            label: 'deepscan-enable',
            kind: vscode_languageserver_1.CompletionItemKind.Text,
            data: 2
        }, {
            label: 'deepscan-disable-line',
            kind: vscode_languageserver_1.CompletionItemKind.Text,
            data: 3
        }, {
            label: 'deepscan-enable-line',
            kind: vscode_languageserver_1.CompletionItemKind.Text,
            data: 4
        }];
});
connection.onCompletionResolve((item) => {
    switch (item.data) {
        case 1:
            item.detail = 'DeepScan directives',
                item.documentation = 'Disable rules from the position';
            break;
        case 2:
            item.detail = 'DeepScan directives',
                item.documentation = 'Enable rules from the position';
            break;
        case 3:
            item.detail = 'DeepScan directives',
                item.documentation = 'Disable rules in the current line';
            break;
        case 4:
            item.detail = 'DeepScan directives',
                item.documentation = 'Disable rules in the next line';
            break;
    }
    return item;
});
connection.onExecuteCommand((params) => {
    if (params.command === CommandIds.inspectCode) {
        let identifier = params.arguments[0];
        inspect(identifier);
    }
});
connection.listen();
function inspect(identifier) {
    let uri = identifier.uri;
    let textDocument = documents.get(uri);
    let docContent = textDocument.getText();
    const URL = `${deepscanServer}/api/demo`;
    const MAX_LINES = 30000;
    function sendDiagnostics(diagnostics) {
        connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    }
    if (docContent.trim() === '') {
        sendDiagnostics([]);
        connection.sendNotification(StatusNotification.type, { state: Status.none, uri });
        return;
    }
    if (textDocument.lineCount >= MAX_LINES) {
        connection.console.info(`Sorry! We do not support above ${MAX_LINES} lines.`);
        sendDiagnostics([]);
        connection.sendNotification(StatusNotification.type, { state: Status.none, uri });
        return;
    }
    // Send filename with extension to parse correctly in server.
    let fileSuffix = path.extname(uri);
    // The file with a suffix in 'fileSuffixes' will be transmitted as a '.js' file.
    if (fileSuffixes.indexOf(fileSuffix) !== -1) {
        fileSuffix = ".js";
    }
    let filename = `demo${fileSuffix}`;
    let req = request.post({
        proxy: proxyServer || httpProxy,
        url: URL,
        headers: {
            'user-agent': userAgent,
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let diagnostics = getResult(JSON.parse(body).data);
            if (Array.isArray(settings.deepscan.ignoreRules)) {
                diagnostics = _.filter(diagnostics, (diagnostic) => !_.includes(settings.deepscan.ignoreRules, diagnostic.code));
            }
            // Publish the diagnostics
            sendDiagnostics(diagnostics);
            connection.sendNotification(StatusNotification.type, { state: diagnostics.length > 0 ? Status.warn : Status.ok, uri });
        }
        else {
            const message = error ? error.message : parseSilently(body);
            connection.console.error(`Failed to inspect: ${message}`);
            // Clear problems
            sendDiagnostics([]);
            connection.sendNotification(StatusNotification.type, { state: Status.fail, error: message });
        }
    });
    var form = req.form();
    form.append('file', docContent, {
        filename,
        contentType: 'text/plain'
    });
}
function getResult(result) {
    let alarms = result.alarms;
    let diagnostics = [];
    alarms.forEach((alarm) => {
        let diagnostic = makeDiagnostic(alarm);
        diagnostics.push(diagnostic);
    });
    return diagnostics;
}
function makeDiagnostic(alarm) {
    let message = alarm.message;
    let l = parseLocation(alarm.location);
    let startLine = Math.max(0, l.startLine - 1);
    let startChar = Math.max(0, l.startCh - 1);
    let endLine = l.endLine != null ? Math.max(0, l.endLine - 1) : startLine;
    let endChar = l.endCh != null ? Math.max(0, l.endCh - 1) : startChar;
    return {
        message: `${message} (${alarm.name})`,
        severity: convertSeverity(alarm.impact),
        source: 'deepscan',
        range: {
            start: { line: startLine, character: startChar },
            end: { line: endLine, character: endChar }
        },
        code: alarm.name
    };
}
function parseLocation(location) {
    var startLocation = location.split('-')[0], endLocation = location.split('-')[1];
    var startLine = Number(startLocation.split(':')[0]), startCh = Number(startLocation.split(':')[1]);
    var endLine = Number(endLocation.split(':')[0]), endCh = Number(endLocation.split(':')[1]);
    return {
        startLine: startLine,
        startCh: startCh,
        endLine: endLine,
        endCh: endCh
    };
}
function detachSlash(path) {
    var len = path.length;
    if (path[len - 1] === '/') {
        return path.substr(0, len - 1);
    }
    else {
        return path;
    }
}
function parseSilently(body) {
    try {
        return JSON.parse(body).reason;
    }
    catch (e) {
        return null;
    }
}
//# sourceMappingURL=server.js.map