"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CodeMetricsCodeLens_1 = require("../models/CodeMetricsCodeLens");
class CodeMetricsCodeLensProvider {
    constructor(metricsUtil) {
        this.metricsUtil = metricsUtil;
    }
    provideCodeLenses(document, token) {
        if (!this.metricsUtil.appConfig.codeMetricsDisplayed)
            return;
        if (!this.metricsUtil.appConfig.getCodeMetricsSettings(document.uri).CodeLensEnabled)
            return;
        return this.metricsUtil.getMetrics(document).then(metrics => {
            const result = metrics.map(model => new CodeMetricsCodeLens_1.CodeMetricsCodeLens(model, document.uri, this.metricsUtil.toRange(model, document)));
            return result;
        });
    }
    resolveCodeLens(codeLens, token) {
        if (codeLens instanceof CodeMetricsCodeLens_1.CodeMetricsCodeLens) {
            codeLens.command = {
                title: this.metricsUtil.format(codeLens),
                command: "codemetrics.showCodeMetricsCodeLensInfo",
                arguments: [codeLens]
            };
            return codeLens;
        }
        return null;
    }
}
exports.CodeMetricsCodeLensProvider = CodeMetricsCodeLensProvider;
//# sourceMappingURL=CodeMetricsCodeLensProvider.js.map