"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionId = 'javascriptBooster';
exports.supportedLanguages = [
    'javascript',
    'javascriptreact',
    'typescript',
    'typescriptreact'
];
function isSupportedLanguage(languageId) {
    return exports.supportedLanguages.indexOf(languageId) !== -1;
}
exports.isSupportedLanguage = isSupportedLanguage;
exports.commandIds = {
    _executeCodeAction: `${exports.extensionId}.executeCodeAction`,
    executeCodeMod: `${exports.extensionId}.executeCodeMod`,
    extendSelection: `${exports.extensionId}.extendSelection`,
    shrinkSelection: `${exports.extensionId}.shrinkSelection`,
    reloadCodeMods: `${exports.extensionId}.reloadCodeMods`
};
exports.configIds = {
    smartExtendFallbackCommand: 'smartExtendFallbackCommand',
    smartShrinkFallbackCommand: 'smartShrinkFallbackCommand'
};
//# sourceMappingURL=const.js.map