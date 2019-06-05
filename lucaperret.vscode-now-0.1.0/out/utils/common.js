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
const fs = require("fs");
const vscode = require("vscode");
const requestNative = require("request-promise-native");
const authentication_1 = require("./authentication");
const config_1 = require("../config");
const IS_WIN = process.platform.startsWith('win');
const SEP = IS_WIN ? '\\' : '/';
function getNodeModule(moduleName) {
    try {
        return require(`${vscode.env.appRoot}/node_modules.asar/${moduleName}`);
    }
    catch (err) { }
    try {
        return require(`${vscode.env.appRoot}/node_modules/${moduleName}`);
    }
    catch (err) { }
    return undefined;
}
exports.getNodeModule = getNodeModule;
function request(method, endpoint, hasAuthentication, body, qs, headers = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        if (hasAuthentication) {
            headers.Authorization = 'Bearer ' + (yield authentication_1.getAuthenticationToken());
        }
        const options = {
            method,
            uri: config_1.default.URL + endpoint,
            headers,
            body,
            qs,
            json: true
        };
        try {
            response = yield requestNative(options);
        }
        catch (e) {
            throw new Error(e.error.error.message);
        }
        return response;
    });
}
exports.request = request;
function requireFile(modulePath, _default = {}) {
    try {
        return require(modulePath);
    }
    catch (error) {
        return _default;
    }
}
exports.requireFile = requireFile;
function mayBeRead(filePath, _default = null) {
    try {
        return fs.readFileSync(filePath);
    }
    catch (error) {
        return _default;
    }
}
exports.mayBeRead = mayBeRead;
function absoluteToRelative(base, filePath) {
    const fullBase = base.endsWith(SEP) ? base : base + SEP;
    let relative = filePath.substr(fullBase.length);
    if (relative.startsWith(SEP)) {
        relative = relative.substr(1);
    }
    return relative.replace(/\\/g, '/');
}
exports.absoluteToRelative = absoluteToRelative;
//# sourceMappingURL=common.js.map