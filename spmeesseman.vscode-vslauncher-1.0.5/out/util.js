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
const extension_1 = require("./extension");
const vscode_1 = require("vscode");
const fs = require("fs");
const logValueWhiteSpace = 40;
function camelCase(name, indexUpper) {
    if (!name) {
        return name;
    }
    return name
        .replace(/(?:^\w|[A-Za-z]|\b\w)/g, (letter, index) => {
        return index !== indexUpper ? letter.toLowerCase() : letter.toUpperCase();
    })
        .replace(/[\s\-]+/g, '');
}
exports.camelCase = camelCase;
function properCase(name) {
    if (!name) {
        return name;
    }
    return name
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
        return index !== 0 ? letter.toLowerCase() : letter.toUpperCase();
    })
        .replace(/[\s\-]+/g, '');
}
exports.properCase = properCase;
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.timeout = timeout;
function pathExists(path) {
    try {
        fs.accessSync(path);
    }
    catch (err) {
        return false;
    }
    return true;
}
exports.pathExists = pathExists;
function readFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data.toString());
            });
        });
    });
}
exports.readFile = readFile;
function log(msg, level) {
    return __awaiter(this, void 0, void 0, function* () {
        //let cfgLevel = configuration.get<number>('logLevel');
        if (vscode_1.workspace.getConfiguration('vsLauncher').get('debug') === true) {
            console.log(msg);
            extension_1.logOutputChannel.appendLine(msg);
        }
    });
}
exports.log = log;
function logValue(msg, value, level) {
    return __awaiter(this, void 0, void 0, function* () {
        var logMsg = msg;
        //let cfgLevel = configuration.get<number>('logLevel');
        for (var i = msg.length; i < logValueWhiteSpace; i++) {
            logMsg += ' ';
        }
        if (value || value === 0 || value === '') {
            logMsg += ': ';
            logMsg += value.toString();
        }
        else if (value === undefined) {
            logMsg += ': undefined';
        }
        else if (value === null) {
            logMsg += ': null';
        }
        if (vscode_1.workspace.getConfiguration('vsLauncher').get('debug') === true) {
            console.log(logMsg);
            extension_1.logOutputChannel.appendLine(logMsg);
        }
    });
}
exports.logValue = logValue;
//# sourceMappingURL=util.js.map