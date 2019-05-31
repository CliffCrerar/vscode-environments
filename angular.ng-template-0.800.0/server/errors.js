"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_languageserver_1 = require("vscode-languageserver");
var ErrorCollector = /** @class */ (function () {
    function ErrorCollector(documents, connection, initialDelay, nextDelay) {
        if (initialDelay === void 0) { initialDelay = 750; }
        if (nextDelay === void 0) { nextDelay = 20; }
        this.documents = documents;
        this.connection = connection;
        this.initialDelay = initialDelay;
        this.nextDelay = nextDelay;
    }
    ErrorCollector.prototype.requestErrors = function () {
        var _this = this;
        var documents = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            documents[_i] = arguments[_i];
        }
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        var index = 0;
        var process;
        process = function () {
            _this.timer = undefined;
            _this.sendErrorsFor(documents[index++]);
            if (index < documents.length)
                _this.timer = setTimeout(process, _this.nextDelay);
        };
        this.timer = setTimeout(process, this.initialDelay);
    };
    ErrorCollector.prototype.sendErrorsFor = function (document) {
        var _a;
        var _b = this.documents.getServiceInfo(document), fileName = _b.fileName, service = _b.service;
        if (service) {
            var diagnostics = service.getDiagnostics(fileName);
            if (diagnostics) {
                var offsets = (_a = []).concat.apply(_a, diagnostics.map(function (d) { return [d.span.start, d.span.end]; }));
                var positions = this.documents.offsetsToPositions(document, offsets);
                var ranges_1 = [];
                for (var i = 0; i < positions.length; i += 2) {
                    ranges_1.push(vscode_languageserver_1.Range.create(positions[i], positions[i + 1]));
                }
                this.connection.sendDiagnostics({
                    uri: document.uri,
                    diagnostics: diagnostics.map(function (diagnostic, i) { return ({
                        range: ranges_1[i],
                        message: flattenChain(diagnostic.message, ''),
                        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                        source: 'Angular'
                    }); })
                });
            }
        }
    };
    return ErrorCollector;
}());
exports.ErrorCollector = ErrorCollector;
function flattenChain(message, prefix) {
    if (typeof message === 'string') {
        return "" + prefix + message;
    }
    if (message.next) {
        return "" + prefix + message.message + "\n" + flattenChain(message.next, prefix + '  ');
    }
    return "" + prefix + message.message;
}
//# sourceMappingURL=errors.js.map