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
const path = require("path");
const promisify = require("promisify-node");
const fs = promisify('fs');
function hasLinkedModules(rootPath) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO
        return (yield getLinkedModules(rootPath)).length > 0;
    });
}
exports.hasLinkedModules = hasLinkedModules;
function getLinkedModules(rootPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return _getLinkedModules(path.join(rootPath, 'node_modules'));
    });
}
exports.getLinkedModules = getLinkedModules;
function _getLinkedModules(nodeModulesDir) {
    return __awaiter(this, void 0, void 0, function* () {
        let modules;
        try {
            modules = yield fs.readdir(nodeModulesDir);
        }
        catch (e) {
            return [];
        }
        const linkedModules = yield _getLinkedModulesFromDir(nodeModulesDir, modules);
        for (let m of modules) {
            if (m.startsWith('@')) {
                linkedModules.push(...yield _getLinkedModules(path.join(nodeModulesDir, m)));
            }
        }
        return linkedModules;
    });
}
function _getLinkedModulesFromDir(nodeModulesDir, modules) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield Promise.all(modules.map((m) => __awaiter(this, void 0, void 0, function* () {
            const absPath = path.join(nodeModulesDir, m);
            if (yield isLinked(absPath)) {
                return {
                    name: m,
                    actualPath: yield _getSymlinkTarget(absPath)
                };
            }
            else {
                return null;
            }
        })));
        return results.filter(result => !!result);
    });
}
function _getSymlinkTarget(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = yield fs.readlink(folderPath);
        const absTarget = path.resolve(folderPath, '..', target);
        if (yield isLinked(absTarget)) {
            return _getSymlinkTarget(absTarget);
        }
        return absTarget;
    });
}
function isLinked(folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stat = yield fs.lstat(folderPath);
            return stat.isSymbolicLink();
        }
        catch (e) {
            return false;
        }
    });
}
//# sourceMappingURL=linkedModules.js.map