/* --------------------------------------------------------------------------------------------
 * Copyright (c) S-Core Co., Ltd. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
function warn(client, message, showMessage = false) {
    client && client.warn(message);
    showMessage && vscode.window.showWarningMessage(message);
}
exports.warn = warn;
function sendRequest(client, command, successCallback, args = []) {
    const params = {
        command,
        arguments: args
    };
    client.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, params).then(successCallback, (error) => {
        console.error('Server failed', error);
        vscode.window.showErrorMessage('Failed to send a request. Please consider opening an issue with steps to reproduce.');
    });
}
exports.sendRequest = sendRequest;
//# sourceMappingURL=utils.js.map