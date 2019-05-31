"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const config_1 = require("./config");
const diffDocProvider_1 = require("./diffDocProvider");
const FS_REGEX = /\\/g;
exports.UNCOMMITTED = '*';
function abbrevCommit(commitHash) {
    return commitHash.substring(0, 8);
}
exports.abbrevCommit = abbrevCommit;
function getPathFromUri(uri) {
    return uri.fsPath.replace(FS_REGEX, '/');
}
exports.getPathFromUri = getPathFromUri;
function getPathFromStr(str) {
    return str.replace(FS_REGEX, '/');
}
exports.getPathFromStr = getPathFromStr;
function copyToClipboard(text) {
    return new Promise(resolve => {
        vscode.env.clipboard.writeText(text).then(() => resolve(true), () => resolve(false));
    });
}
exports.copyToClipboard = copyToClipboard;
function viewDiff(repo, fromHash, toHash, oldFilePath, newFilePath, type) {
    return new Promise(resolve => {
        let options = { preview: true, viewColumn: config_1.getConfig().openDiffTabLocation() };
        if (type !== 'U') {
            let abbrevFromHash = abbrevCommit(fromHash), abbrevToHash = toHash !== exports.UNCOMMITTED ? abbrevCommit(toHash) : 'Present', pathComponents = newFilePath.split('/');
            let desc = fromHash === toHash
                ? fromHash === exports.UNCOMMITTED
                    ? 'Uncommitted'
                    : (type === 'A' ? 'Added in ' + abbrevToHash : type === 'D' ? 'Deleted in ' + abbrevToHash : abbrevFromHash + '^ ↔ ' + abbrevToHash)
                : (type === 'A' ? 'Added between ' + abbrevFromHash + ' & ' + abbrevToHash : type === 'D' ? 'Deleted between ' + abbrevFromHash + ' & ' + abbrevToHash : abbrevFromHash + ' ↔ ' + abbrevToHash);
            let title = pathComponents[pathComponents.length - 1] + ' (' + desc + ')';
            if (fromHash === exports.UNCOMMITTED)
                fromHash = 'HEAD';
            vscode.commands.executeCommand('vscode.diff', diffDocProvider_1.encodeDiffDocUri(repo, oldFilePath, fromHash === toHash ? fromHash + '^' : fromHash, type), diffDocProvider_1.encodeDiffDocUri(repo, newFilePath, toHash, type), title, options)
                .then(() => resolve(true), () => resolve(false));
        }
        else {
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(repo + '/' + newFilePath), options)
                .then(() => resolve(true), () => resolve(false));
        }
    });
}
exports.viewDiff = viewDiff;
function viewScm() {
    return new Promise(resolve => {
        vscode.commands.executeCommand('workbench.view.scm').then(() => resolve(true), () => resolve(false));
    });
}
exports.viewScm = viewScm;
function runCommandInNewTerminal(cwd, command, name) {
    let terminal = vscode.window.createTerminal({ cwd: cwd, name: name });
    terminal.sendText(command);
    terminal.show();
}
exports.runCommandInNewTerminal = runCommandInNewTerminal;
function evalPromises(data, maxParallel, createPromise) {
    return new Promise((resolve, reject) => {
        if (data.length === 1) {
            createPromise(data[0]).then(v => resolve([v])).catch(() => reject());
        }
        else if (data.length === 0) {
            resolve([]);
        }
        else {
            let results = new Array(data.length), nextPromise = 0, rejected = false, completed = 0;
            function startNext() {
                let cur = nextPromise;
                nextPromise++;
                createPromise(data[cur]).then(result => {
                    if (!rejected) {
                        results[cur] = result;
                        completed++;
                        if (nextPromise < data.length)
                            startNext();
                        else if (completed === data.length)
                            resolve(results);
                    }
                }).catch(() => {
                    reject();
                    rejected = true;
                });
            }
            for (let i = 0; i < maxParallel && i < data.length; i++)
                startNext();
        }
    });
}
exports.evalPromises = evalPromises;
//# sourceMappingURL=utils.js.map