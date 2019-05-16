"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const searchCodeActionCode = Math.floor(Math.random() * 1000000);
exports.config = {
    get all() {
        return vscode.workspace.getConfiguration("materialdesigniconsIntellisense");
    },
    get iconSize() {
        return exports.config.all.get("iconSize") || 100;
    },
    get iconColor() {
        return exports.config.all.get("iconColor") || "#bababa";
    },
    get selector() {
        return exports.config.all.get("selector") || [];
    },
    get includeAliases() {
        return exports.config.all.get("includeAliases") || false;
    },
    get prefix() {
        return exports.config.all.get("insertPrefix") || "";
    },
    get suffix() {
        return exports.config.all.get("insertSuffix") || "";
    },
    get mdiPath() {
        return (exports.config.all.get("overrideFontPackagePath") ||
            path.normalize(path.join(__dirname, "../node_modules/@mdi/svg/")));
    },
    get mdiPackagePath() {
        return path.normalize(path.join(exports.config.mdiPath, "package.json"));
    },
    get mdiMetaDataPath() {
        return path.normalize(path.join(exports.config.mdiPath, "meta.json"));
    },
    get searchCodeActionCode() {
        return searchCodeActionCode;
    },
    get insertType() {
        return exports.config.all.get("insertStyle");
    },
    insertTypeSpecificConfig(type) {
        return exports.config.all.get(type);
    },
    lastSearch: ""
};
//# sourceMappingURL=configuration.js.map