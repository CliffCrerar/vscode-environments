"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SelectSubscriptionsNode {
    constructor() {
    }
    getTreeItem() {
        return {
            label: "Click to select subscriptions, or subscriptions is loading",
            command: {
                command: "azure-account.selectSubscriptions",
                title: "",
            },
        };
    }
    getChildren() {
        return [];
    }
}
exports.SelectSubscriptionsNode = SelectSubscriptionsNode;
//# sourceMappingURL=selectSubscriptionsNode.js.map