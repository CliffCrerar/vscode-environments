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
const os = require("os");
const path = require("path");
const fse = require("fs-extra");
function getSecretsPath(id) {
    return getSecretsPathForSystem(id, getOperatingSystem());
}
exports.getSecretsPath = getSecretsPath;
var OperatingSystem;
(function (OperatingSystem) {
    OperatingSystem[OperatingSystem["Windows"] = 0] = "Windows";
    OperatingSystem[OperatingSystem["Linux"] = 1] = "Linux";
    OperatingSystem[OperatingSystem["macOS"] = 2] = "macOS";
    OperatingSystem[OperatingSystem["Other"] = 3] = "Other";
})(OperatingSystem || (OperatingSystem = {}));
function getOperatingSystem() {
    switch (os.platform()) {
        case 'win32':
            return OperatingSystem.Windows;
        case 'linux':
            return OperatingSystem.Linux;
        case 'darwin':
            return OperatingSystem.macOS;
        default:
            return OperatingSystem.Other;
    }
}
function getSecretsPathForSystem(id, system) {
    if (system === OperatingSystem.Windows) {
        return path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'UserSecrets', id, 'secrets.json');
    }
    else if (system === OperatingSystem.Linux || system === OperatingSystem.macOS) {
        return path.join(os.homedir(), '.microsoft', 'usersecrets', id, 'secrets.json');
    }
    else {
        return;
    }
}
function ensureSecretsExist(secretsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fse.existsSync(secretsPath)) {
            yield fse.outputFile(secretsPath, getEmptyJsonFileContent());
        }
    });
}
exports.ensureSecretsExist = ensureSecretsExist;
function getEmptyJsonFileContent() {
    return `{${os.EOL}${os.EOL}}`;
}
//# sourceMappingURL=secretsJson.js.map