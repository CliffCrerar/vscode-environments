"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class CodeMetricsCodeLens extends vscode_1.CodeLens {
    constructor(model, uri, range) {
        super(range);
        this.model = model;
        this.uri = uri;
    }
    getCollectedComplexity() {
        return this.model.getCollectedComplexity();
    }
    toString(appConfig) {
        return this.model.toString(appConfig.getCodeMetricsSettings(this.uri));
    }
    getExplanation(appConfig) {
        return this.model.getExplanation();
    }
    getChildren() {
        return this.model.children;
    }
}
exports.CodeMetricsCodeLens = CodeMetricsCodeLens;
//# sourceMappingURL=CodeMetricsCodeLens.js.map