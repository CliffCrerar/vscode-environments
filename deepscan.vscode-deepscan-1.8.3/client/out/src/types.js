/* --------------------------------------------------------------------------------------------
 * Copyright (c) S-Core Co., Ltd. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageclient_1 = require("vscode-languageclient");
var CommandIds;
(function (CommandIds) {
    CommandIds.showOutput = 'deepscan.showOutputView';
})(CommandIds = exports.CommandIds || (exports.CommandIds = {}));
var Status;
(function (Status) {
    Status[Status["none"] = 0] = "none";
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["fail"] = 3] = "fail"; // Analysis failed
})(Status = exports.Status || (exports.Status = {}));
// "severity" of client.diagnostics. Seems not to comply with the DiagnosticSeverity of language-server.
var DiagnosticSeverity;
(function (DiagnosticSeverity) {
    DiagnosticSeverity[DiagnosticSeverity["Error"] = 0] = "Error";
    DiagnosticSeverity[DiagnosticSeverity["Warning"] = 1] = "Warning";
    DiagnosticSeverity[DiagnosticSeverity["Information"] = 2] = "Information";
})(DiagnosticSeverity = exports.DiagnosticSeverity || (exports.DiagnosticSeverity = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = new vscode_languageclient_1.NotificationType('deepscan/status');
})(StatusNotification = exports.StatusNotification || (exports.StatusNotification = {}));
//# sourceMappingURL=types.js.map