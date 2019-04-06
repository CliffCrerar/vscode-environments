'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const Git_1 = require("./Git");
(new Git_1.default()).hasGitRepository().then(() => {
    vscode_1.commands.executeCommand('setContext', 'hasGitRepository', true);
});
//# sourceMappingURL=init.js.map