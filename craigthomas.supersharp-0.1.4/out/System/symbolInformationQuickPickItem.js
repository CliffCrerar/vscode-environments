'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class SymbolInformationQuickPickItem {
    constructor(symbol) {
        this.symbol = symbol;
        this.label = symbol.name;
        this.description = vscode_1.SymbolKind[symbol.kind];
        this.detail = symbol.location.uri.path;
    }
}
exports.default = SymbolInformationQuickPickItem;
//# sourceMappingURL=symbolInformationQuickPickItem.js.map