"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ToSignInNode {
    constructor() {
    }
    getTreeItem() {
        return {
            label: "Click to sign in",
            command: {
                command: "azure-account.login",
                title: "",
            },
        };
    }
    getChildren() {
        return [];
    }
}
exports.ToSignInNode = ToSignInNode;
//# sourceMappingURL=toSignInNode.js.map