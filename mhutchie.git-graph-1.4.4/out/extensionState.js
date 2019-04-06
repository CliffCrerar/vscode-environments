"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LAST_ACTIVE_REPO = 'lastActiveRepo';
class ExtensionState {
    constructor(context) {
        this.workspaceState = context.workspaceState;
    }
    getLastActiveRepo() {
        return this.workspaceState.get(LAST_ACTIVE_REPO, null);
    }
    setLastActiveRepo(repo) {
        this.workspaceState.update(LAST_ACTIVE_REPO, repo);
    }
}
exports.ExtensionState = ExtensionState;
//# sourceMappingURL=extensionState.js.map