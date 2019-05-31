"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Util {
    static findFile(glob) {
        return new Promise((resolve, reject) => {
            const searchPaths = vscode.workspace.getConfiguration('angularExplorer').get('searchLocations');
            if (searchPaths) {
                for (let searchPath of searchPaths) {
                    vscode.workspace.findFiles(searchPath + '/**' + glob).then(value => resolve(value[0]), reason => reject(reason));
                }
            }
        });
    }
    static findFiles(glob) {
        return new Promise((resolve, reject) => {
            // const startTime = new Date().getTime();
            const searchPaths = vscode.workspace.getConfiguration('angularExplorer').get('searchLocations');
            let thenables = [];
            let files = [];
            if (searchPaths && vscode.workspace.workspaceFolders) {
                for (let searchPath of searchPaths) {
                    const pattern = new vscode.RelativePattern(vscode.workspace.workspaceFolders[0].uri.fsPath + '/' + searchPath, '**' + glob);
                    thenables.push(vscode.workspace.findFiles(pattern).then(uris => {
                        files.push(...uris);
                    }, reason => console.log(reason)));
                }
            }
            Promise.all(thenables).then(() => {
                resolve(files);
                // const endTime = new Date().getTime();
                // console.log('-> search finished (' + glob + '), found ' + files.length + ' files, needed ' + ((endTime - startTime) / 1000) + 's');
            }, reason => reject(reason));
        });
    }
    static getAbsolutePath(base, relative) {
        let stack = base.split("/");
        let parts = relative.split("/");
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === ".") {
                continue;
            }
            if (parts[i] === "..") {
                stack.pop();
            }
            else {
                stack.push(parts[i]);
            }
        }
        return stack.join("/");
    }
}
Util.startTime = new Date().getTime();
exports.Util = Util;
//# sourceMappingURL=util.js.map