"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const minimatch_1 = require("minimatch");
const vscode_languageserver_1 = require("vscode-languageserver");
const protocol_1 = require("../common/protocol");
const tsmetrics_core_1 = require("tsmetrics-core");
const LuaMetrics_1 = require("./LuaMetrics");
let connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
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
connection.onRequest(protocol_1.MetricsRequestType, RequestData => {
    let document = documents.get(RequestData.uri);
    const metrics = new MetricsUtil(RequestData.configuration);
    return metrics.getMetrics(document);
});
class MetricsUtil {
    constructor(appConfig) {
        this.appConfig = appConfig;
    }
    isLanguageDisabled(languageId) {
        if (languageId == "typescript" && !this.appConfig.EnabledForTS)
            return true;
        if (languageId == "typescriptreact" && !this.appConfig.EnabledForTSX)
            return true;
        if (languageId == "javascript" && !this.appConfig.EnabledForJS)
            return true;
        if (languageId == "javascriptreact" && !this.appConfig.EnabledForJSX)
            return true;
        if (languageId == "lua" && !this.appConfig.EnabledForLua)
            return true;
        if (languageId == "vue" && !this.appConfig.EnabledForVue)
            return true;
        if (languageId == "html" && !this.appConfig.EnabledForHTML)
            return true;
        return false;
    }
    isAboveFileSizeLimit(fileContent) {
        if (this.appConfig.FileSizeLimitMB < 0) {
            return false;
        }
        try {
            let fileSizeInBytes = fileContent.length;
            let configuredLimit = this.appConfig.FileSizeLimitMB * 1024 * 1024;
            return fileSizeInBytes > configuredLimit;
        }
        catch (error) {
            return false;
        }
    }
    isExcluded(fileName) {
        const exclusionList = this.appConfig.Exclude || [];
        return exclusionList.some(pattern => {
            return new minimatch_1.Minimatch(pattern).match(fileName);
        });
    }
    getMetrics(document) {
        const target = ts.ScriptTarget.Latest;
        const result = [];
        let input = document.getText();
        let diagnostics = [];
        if (!this.isExcluded(document.uri) &&
            !this.isAboveFileSizeLimit(input) &&
            !this.isLanguageDisabled(document.languageId)) {
            var metrics = undefined;
            if (this.isHTMLLike(document.languageId)) {
                input = input.replace(/<script>/gim, "<scrip*/");
                input = input.replace(/<\/script>/gim, "/*script>");
                input = "/*" + input.substring(2, input.length - 2) + "*/";
                metrics = tsmetrics_core_1.MetricsParser.getMetricsFromText(document.uri, input, this.appConfig, target);
            }
            else if (this.isLua(document.languageId)) {
                metrics = {
                    file: document.uri,
                    metrics: new LuaMetrics_1.LuaMetrics().getMetricsFromLuaSource(this.appConfig.LuaStatementMetricsConfiguration, input)
                };
            }
            else {
                metrics = tsmetrics_core_1.MetricsParser.getMetricsFromText(document.uri, input, this.appConfig, target);
            }
            var collect = (model) => {
                if (model.visible && model.getCollectedComplexity() >= this.appConfig.CodeLensHiddenUnder) {
                    result.push(model);
                }
                model.children.forEach(element => {
                    collect(element);
                });
            };
            collect(metrics.metrics);
            if (this.appConfig.DiagnosticsEnabled) {
                diagnostics = result.map(model => {
                    return {
                        range: vscode_languageserver_1.Range.create(document.positionAt(model.start), document.positionAt(model.end)),
                        message: model.toString(this.appConfig),
                        source: "codemetrics",
                        severity: vscode_languageserver_1.DiagnosticSeverity.Hint,
                        code: "42"
                    };
                });
            }
        }
        connection.sendDiagnostics({ uri: document.uri, diagnostics: diagnostics });
        return result;
    }
    isLua(languageId) {
        return languageId == "lua";
    }
    isVue(languageId) {
        return languageId == "vue";
    }
    isHTML(languageId) {
        return languageId == "html";
    }
    isHTMLLike(languageId) {
        return this.isVue(languageId) || this.isHTML(languageId);
    }
}
connection.listen();
//# sourceMappingURL=server.js.map