"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packageJsonManager_1 = require("./packageJsonManager");
const fs = require("fs");
class FileManager {
    isPackageJson(document) {
        return packageJsonManager_1.default.isPackageJson(document);
    }
    exists(path) {
        return fs.existsSync(path);
    }
}
exports.default = new FileManager();
//# sourceMappingURL=fileManager.js.map