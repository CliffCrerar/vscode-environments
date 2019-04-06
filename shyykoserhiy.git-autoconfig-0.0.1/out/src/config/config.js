"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
exports.CUSTOM_GIT_CONFIG = {
    "user.name": "custom",
    "user.email": ""
};
const CONFIG_LIST_KEY = 'configList';
function getConfig() {
    return vscode_1.workspace.getConfiguration('git-autoconfig');
}
exports.getConfig = getConfig;
function getConfigQueryInterval() {
    return getConfig().get('queryInterval');
}
exports.getConfigQueryInterval = getConfigQueryInterval;
function generateGitConfigKey(c) {
    return `${c["user.email"]} ${c["user.name"]}`;
}
exports.generateGitConfigKey = generateGitConfigKey;
function getConfigList() {
    return getConfig().get(CONFIG_LIST_KEY);
}
exports.getConfigList = getConfigList;
function updateConfigList(configList) {
    return getConfig().update(CONFIG_LIST_KEY, configList, true);
}
exports.updateConfigList = updateConfigList;
//# sourceMappingURL=config.js.map