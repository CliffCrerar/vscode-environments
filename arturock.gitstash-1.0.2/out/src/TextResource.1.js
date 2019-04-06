'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class TextResource {
    constructor() {
        this.scheme = 'gitdiff:';
    }
    getUri(text) {
        const timestamp = new Date().getTime();
        return vscode_1.Uri.parse(`${this.scheme}${text}?t=${timestamp}`);
    }
}
exports.default = TextResource;
//# sourceMappingURL=TextResource.1.js.map