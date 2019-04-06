"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class RepoFolderWatcher {
    constructor(repoChangeCallback) {
        this.changeHandler = null;
        this.repoChangeCallback = repoChangeCallback;
        this.start();
    }
    start() {
        if (this.changeHandler !== null) {
            this.stop();
        }
        this.changeHandler = vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.repoChangeCallback();
        });
    }
    stop() {
        if (this.changeHandler !== null) {
            this.changeHandler.dispose();
            this.changeHandler = null;
        }
    }
}
exports.RepoFolderWatcher = RepoFolderWatcher;
//# sourceMappingURL=repoFolderWatcher.js.map