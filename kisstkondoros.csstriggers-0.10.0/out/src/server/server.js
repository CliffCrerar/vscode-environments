"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const liveData_1 = require("./liveData");
const protocol_1 = require("../common/protocol");
let connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
let cssTriggersPromise = liveData_1.fetchCssTriggers();
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
let documents = new vscode_languageserver_1.TextDocuments();
documents.listen(connection);
connection.onInitialize(() => {
    return {
        capabilities: {
            textDocumentSync: documents.syncKind
        }
    };
});
connection.onRequest(protocol_1.CssTriggerSymbolRequestType, request => {
    let document = documents.get(request.uri);
    return cssTriggersPromise.then(triggers => decorateCssProperties(document, request, triggers));
});
function camelCaseToDash(myStr) {
    return myStr.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function decorateCssProperties(document, request, cssTriggers) {
    var result = {
        symbols: []
    };
    if (!document) {
        return;
    }
    const lines = document.getText().split(/\r\n|\r|\n/);
    for (const lineIndex of request.visibleLines) {
        const text = lines[lineIndex];
        var match;
        var regex = /([\-a-z])+\s*:/gi;
        while ((match = regex.exec(text))) {
            const capturingGroup = match[0].substr(0, match[0].length - 1).trim();
            const trigger = cssTriggers.data[capturingGroup] || cssTriggers.data[camelCaseToDash(capturingGroup)];
            if (trigger) {
                var index = match.index;
                var start = vscode_languageserver_1.Position.create(lineIndex, index);
                var previousNonWhiteSpaceChar = text
                    .substr(0, match.index)
                    .trim()
                    .substr(-1);
                if (previousNonWhiteSpaceChar == "$" || previousNonWhiteSpaceChar == "(") {
                    continue;
                }
                var end = vscode_languageserver_1.Position.create(lineIndex, index + capturingGroup.length);
                result.symbols.push({
                    range: { start: start, end: end },
                    data: trigger
                });
            }
        }
    }
    return result;
}
connection.listen();
//# sourceMappingURL=server.js.map