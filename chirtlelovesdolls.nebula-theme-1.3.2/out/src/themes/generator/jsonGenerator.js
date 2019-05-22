"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workspaceColors_1 = require("../workspaceColors");
const tokenGroups_1 = require("../tokenGroups");
const workspaceColorGenerator_1 = require("./workspaceColorGenerator");
const constants_1 = require("./constants");
const merge = require("lodash.merge");
const models_1 = require("../../models");
const path = require("path");
const fs = require("fs");
const tokenGenerator_1 = require("./tokenGenerator");
/**
 * Create the JSON file that is responsible for the theme's appearance in the editor.
 */
exports.createThemeFile = (jsonOptions) => {
    // override the default options with the new options
    const options = merge({}, exports.getDefaultThemeOptions(), jsonOptions);
    const themeJsonPath = path.join(__dirname, '../../../', 'src', constants_1.themeJsonName);
    const json = exports.generateThemeConfigurationObject(options);
    return new Promise((resolve, reject) => {
        fs.writeFile(themeJsonPath, JSON.stringify(json, undefined, 2), (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(constants_1.themeJsonName);
            }
        });
    });
};
/**
 * Generate the complete theme configuration object that can be written as JSON file.
 */
exports.generateThemeConfigurationObject = (options) => {
    const themeConfig = merge({}, new models_1.ThemeConfiguration(), { options });
    const workspaceColorDefinitions = workspaceColorGenerator_1.getWorkspaceColorDefinitions(workspaceColors_1.workspaceColors, themeConfig, options);
    const tokenColorDefinitions = tokenGenerator_1.getTokenStyleDefinitions(tokenGroups_1.tokenGroups, themeConfig, options);
    return merge({}, workspaceColorDefinitions, tokenColorDefinitions);
};
/**
 * The options control the generator
 */
exports.getDefaultThemeOptions = () => ({
    commentItalics: true,
    themeItalics: models_1.ItalicsTheme.Basic,
    materialize: false
});
//# sourceMappingURL=jsonGenerator.js.map