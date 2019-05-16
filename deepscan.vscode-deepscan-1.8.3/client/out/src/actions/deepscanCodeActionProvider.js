/* --------------------------------------------------------------------------------------------
 * Copyright (c) S-Core Co., Ltd. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class deepscanCodeActionProvider {
    constructor(id) {
        this.scheme = 'deepscan';
        this.commandId = `${this.scheme}.${id}`;
        this.uri = vscode.Uri.parse(`${this.scheme}://${id}`);
    }
    provideCodeActions(document, range, context, token) {
        let diagnostics = context.diagnostics.filter(diagnostic => this.scheme === diagnostic.source);
        return this.codeActions(document, range, diagnostics, token);
    }
    getScheme() {
        return this.scheme;
    }
    getCommandId() {
        return this.commandId;
    }
    getUri() {
        return this.uri;
    }
}
exports.default = deepscanCodeActionProvider;
//# sourceMappingURL=deepscanCodeActionProvider.js.map