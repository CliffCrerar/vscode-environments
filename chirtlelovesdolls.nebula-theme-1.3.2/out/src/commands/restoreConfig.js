"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("./../helpers");
const index_1 = require("../themes/index");
/** Restore all configurations to default. */
exports.restoreDefaultConfig = () => {
    const defaultOptions = index_1.getDefaultThemeOptions();
    helpers.setThemeConfig('commentItalics', defaultOptions.commentItalics, true);
    helpers.setThemeConfig('themeItalics', defaultOptions.themeItalics, true);
    helpers.setThemeConfig('materialize', defaultOptions.materialize, true);
};
//# sourceMappingURL=restoreConfig.js.map