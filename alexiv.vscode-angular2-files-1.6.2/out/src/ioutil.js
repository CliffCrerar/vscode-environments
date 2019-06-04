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
const vscode_1 = require("vscode");
const fs = require("fs");
const promisify_1 = require("./promisify");
const fsWriteFile = promisify_1.promisify(fs.writeFile);
const fsExists = promisify_1.promisify(fs.exists);
const fsMkdir = promisify_1.promisify(fs.mkdir);
// Get file contents and create the new files in the folder 
exports.createFiles = (loc, files) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield writeFiles(files);
    }
    catch (ex) {
        yield vscode_1.window.showErrorMessage(`File(s) could not be created. ${ex}`);
    }
    return loc.dirPath;
});
const writeFiles = (files) => __awaiter(this, void 0, void 0, function* () {
    const filesPromises = files.map(file => fsWriteFile(file.name, file.content));
    yield Promise.all(filesPromises);
});
// Create the new folder
exports.createFolder = (loc) => __awaiter(this, void 0, void 0, function* () {
    if (loc.dirName) {
        const exists = yield fsExists(loc.dirPath);
        if (exists) {
            throw new Error('Folder already exists');
        }
        yield fsMkdir(loc.dirPath);
    }
    return loc;
});
//# sourceMappingURL=ioutil.js.map