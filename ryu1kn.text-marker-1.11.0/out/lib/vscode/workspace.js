"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = require("../const");
class WorkspaceAdaptor {
    constructor(workspace) {
        this.workspace = workspace;
    }
    get(configName) {
        const extensionConfig = this.workspace.getConfiguration(const_1.EXTENSION_ID);
        return extensionConfig.get(configName);
    }
}
exports.default = WorkspaceAdaptor;
//# sourceMappingURL=workspace.js.map