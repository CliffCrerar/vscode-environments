"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const tsmetrics_core_1 = require("tsmetrics-core");
const protocol_1 = require("./common/protocol");
class MetricsUtil {
    constructor(appConfig, context) {
        this.appConfig = appConfig;
        let serverModule = context.asAbsolutePath(path.join("out", "src", "metrics", "server", "server.js"));
        let debugOptions = { execArgv: ["--nolazy", "--inspect=6004"] };
        let serverOptions = {
            run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
            debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
        };
        var output = vscode_1.window.createOutputChannel("CodeMetrics");
        let error = (message) => {
            output.appendLine(message.jsonrpc);
            return undefined;
        };
        let clientOptions = {
            documentSelector: this.selector.map(p => p.language),
            diagnosticCollectionName: "codemetrics",
            errorHandler: {
                error: error,
                closed: () => {
                    return undefined;
                }
            },
            synchronize: {
                configurationSection: "codemetrics"
            }
        };
        this.client = new vscode_languageclient_1.LanguageClient("CodeMetrics client", serverOptions, clientOptions);
        let disposable = this.client.start();
        context.subscriptions.push(disposable);
    }
    get selector() {
        const tsDocSelector = "typescript";
        const jsDocSelector = "javascript";
        const jsxDocSelector = "javascriptreact";
        const tsxDocSelector = "typescriptreact";
        const luaDocSelector = "lua";
        const vueDocSelector = "vue";
        const htmlDocSelector = "html";
        const supportedSchemes = ["file", "untitled"];
        const supportedLanguages = [
            tsDocSelector,
            jsDocSelector,
            jsxDocSelector,
            tsxDocSelector,
            luaDocSelector,
            vueDocSelector,
            htmlDocSelector
        ];
        const resultingSelector = supportedLanguages
            .map(language => supportedSchemes.map(scheme => {
            return {
                scheme: scheme,
                language: language
            };
        }))
            .reduce((acc, cur) => acc.concat(cur), []);
        return resultingSelector;
    }
    getMetrics(document) {
        const requestData = {
            uri: document.uri.toString(),
            configuration: this.appConfig.getCodeMetricsSettings(document.uri)
        };
        return this.client.onReady().then(() => this.client.sendRequest(protocol_1.MetricsRequestType, requestData).then(metrics => metrics.map(m => {
            return this.convert(m);
        })));
    }
    convert(m) {
        let model = new tsmetrics_core_1.MetricsModel(m.start, m.end, m.text, m.line, m.column, m.complexity, m.description, false, m.visible, m.collectorType);
        model.children = m.children.map(c => this.convert(c));
        return model;
    }
    format(model) {
        return model.toString(this.appConfig);
    }
    toRange(model, document) {
        return new vscode_1.Range(document.positionAt(model.start), document.positionAt(model.end));
    }
    toRangeFromOffset(start, document) {
        return new vscode_1.Range(document.positionAt(start), document.positionAt(start));
    }
    toDecorationRange(start, document) {
        const pos = document.positionAt(start);
        const line = pos.line;
        const documentLine = document.lineAt(line);
        const lineRange = documentLine.range;
        return new vscode_1.Range(lineRange.end.line, lineRange.end.character, lineRange.end.line, lineRange.end.character);
    }
}
exports.MetricsUtil = MetricsUtil;
//# sourceMappingURL=MetricsUtil.js.map