"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const reloadMessages = require("./../messages/reload");
const themes_1 = require("../themes");
/**
 * Get configuration of vs code.
 */
exports.getConfig = (section) => {
    return vscode.workspace.getConfiguration(section);
};
/**
 * Get list of configuration entries of package.json
 */
exports.getExtensionConfiguration = () => {
    return vscode.extensions.getExtension('ChirtleLovesDolls.nebula-theme').packageJSON.contributes.configuration.properties;
};
/**
 * Update configuration of vs code.
 */
exports.setConfig = (section, value, global = false) => {
    return exports.getConfig().update(section, value, global);
};
exports.getThemeConfig = (section) => {
    return exports.getConfig('nebula-theme').inspect(section);
};
/**
 * Set the config of the theme.
 */
exports.setThemeConfig = (section, value, global = false) => {
    return exports.getConfig('nebula-theme').update(section, value, global);
};
/**
 * Is the theme already activated in the editor configuration?
 * @param{boolean} global false by default
 */
exports.isThemeActivated = (global = false) => {
    let curVal = global ? exports.getConfig().inspect('workbench.colorTheme').globalValue
        : exports.getConfig().inspect('workbench.colorTheme').workspaceValue;
    return (curVal === 'Nebula');
};
/**
 * Is the theme not visible for the user?
 */
exports.isThemeNotVisible = () => {
    const config = exports.getConfig().inspect('workbench.colorTheme');
    return (!exports.isThemeActivated(true) && config.workspaceValue === undefined) || // no workspace and not global
        (!exports.isThemeActivated() && config.workspaceValue !== undefined);
};
/**
 * Return the path of the extension in the file system.
 */
exports.getExtensionPath = () => path.join(__dirname, '..', '..', '..');
/**
 * Get the configuration of the theme as JSON Object
 */
exports.getColorThemeJson = () => {
    return new Promise((resolve, reject) => {
        const themeJsonPath = path.join(exports.getExtensionPath(), 'out', 'src', themes_1.themeJsonName);
        fs.readFile(themeJsonPath, 'utf8', (err, data) => {
            if (data) {
                resolve(JSON.parse(data));
            }
            else {
                reject(err);
            }
        });
    });
};
/**
 * Reload vs code window
 */
exports.promptToReload = () => {
    return reloadMessages.showConfirmToReloadMessage().then(result => {
        if (result) {
            exports.reloadWindow();
        }
    });
};
exports.reloadWindow = () => {
    return vscode.commands.executeCommand('workbench.action.reloadWindow');
};
//# sourceMappingURL=index.js.map