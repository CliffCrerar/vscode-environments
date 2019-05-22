"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const i18n = require("./../i18N");
/** User has to confirm if he wants to reload the editor */
exports.showConfirmToReloadMessage = () => {
    return new Promise((resolve, reject) => {
        vscode.window.showInformationMessage(i18n.translate('confirmReload'), i18n.translate('reload')).then(value => {
            switch (value) {
                case i18n.translate('reload'):
                    resolve(true);
                    break;
                default:
                    resolve(false);
                    break;
            }
        });
    });
};
//# sourceMappingURL=reload.js.map