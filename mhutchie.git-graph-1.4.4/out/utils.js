"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function abbrevCommit(commitHash) {
    return commitHash.substring(0, 8);
}
exports.abbrevCommit = abbrevCommit;
function copyToClipboard(text) {
    return new Promise((resolve) => {
        vscode.env.clipboard.writeText(text).then(() => resolve(true), () => resolve(false));
    });
}
exports.copyToClipboard = copyToClipboard;
//# sourceMappingURL=utils.js.map