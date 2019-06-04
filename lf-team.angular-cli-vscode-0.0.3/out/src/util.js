"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
/**
 * 获取当前选中菜单的目录
 */
function getFolderPath(args) {
    const fsPath = args.fsPath;
    return fs.lstatSync(fsPath).isDirectory() ? fsPath : path.dirname(fsPath);
}
exports.getFolderPath = getFolderPath;
//# sourceMappingURL=util.js.map