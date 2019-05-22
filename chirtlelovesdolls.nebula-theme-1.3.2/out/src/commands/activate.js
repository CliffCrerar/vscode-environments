"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const helpers = require("./../helpers");
const i18n = require("./../i18N");
/** Activate the color theme by changing the settings for the colorTheme. */
exports.activateColorTheme = () => {
    return setColorTheme();
};
/** Set the color theme in the config. */
const setColorTheme = () => {
    // global user config
    return helpers.getConfig().update('workbench.colorTheme', 'Nebula', true)
        .then(() => {
        // local workspace config
        if (helpers.getConfig().inspect('workbench.colorTheme').workspaceValue !== undefined) {
            helpers.getConfig().update('workbench.colorTheme', 'Nebula');
        }
        vscode.window.showInformationMessage(i18n.translate('activated'));
    });
};
//# sourceMappingURL=activate.js.map