"use strict";
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: How can we write this to disk too so that we can remotely debug issues?
// TODO: Set env var or something to turn logging on/off?
function log(message, event) {
    let logMessage = `(${new Date().toLocaleString()}) `;
    if (event) {
        logMessage += `[${event}] `;
    }
    logMessage += `${message}`;
    console.log(logMessage);
}
exports.log = log;
//# sourceMappingURL=logger.js.map