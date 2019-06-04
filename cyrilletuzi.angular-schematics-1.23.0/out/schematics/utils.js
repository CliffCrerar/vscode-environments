"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = require("child_process");
const fs = require("fs");
const JSON5 = require("json5");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const osList = new Map();
osList.set('darwin', 'osx');
osList.set('win32', 'windows');
const userOs = osList.get(os.platform()) || 'linux';
// TODO: Manage custom shell for Windows
const userShell = (userOs === 'windows') ? undefined : vscode.workspace.getConfiguration().get(`terminal.integrated.shell.${userOs}`);
class Utils {
    static normalizePath(path) {
        /* Normalize Windows path into Linux format */
        return path.replace(/\\\\/, '/');
    }
    static pathTrimRelative(path) {
        return path.replace('./', '');
    }
    static getDirectoryFromFilename(filename) {
        return filename.replace(/[^\/]*$/, '');
    }
    static getSchemaFromNodeModules(cwd, packageName, filePath) {
        return this.parseJSONFile(this.getNodeModulesPath(cwd, packageName, filePath));
    }
    static getSchemaFromLocal(cwd, schemaPath) {
        return this.parseJSONFile(path.join(cwd, schemaPath));
    }
    static getNodeModulesPath(cwd, ...paths) {
        return path.join(cwd, 'node_modules', ...paths);
    }
    /** @todo Replace with utils.promisify() when Electron / VS Code is updated to Node 8 */
    static readFileAsync(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    /** @todo Replace with utils.promisify() when Electron / VS Code is updated to Node 8 */
    static existsAsync(path) {
        return new Promise((resolve) => {
            fs.exists(path, (exists) => {
                resolve(exists);
            });
        });
    }
    /** @todo Replace with utils.promisify() when Electron / VS Code is updated to Node 8 */
    static execAsync(command, cwd) {
        return new Promise((resolve, reject) => {
            childProcess.exec(command, { cwd, shell: userShell }, (error, stdout, stderr) => {
                if (error) {
                    reject([stdout, stderr]);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    }
    static parseJSONFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            let json = null;
            try {
                const data = yield this.readFileAsync(path);
                json = JSON5.parse(data);
            }
            catch (error) { }
            return json;
        });
    }
    static isSchemaLocal(name) {
        return (name.startsWith('.') && name.endsWith('.json'));
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map