"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
class LocalDataProvider {
    provideTextDocumentContent(uri, token) {
        return this.getReadme(uri.fsPath.substr(0, uri.fsPath.lastIndexOf(path.sep)));
    }
    getReadme(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    return reject(err);
                }
                else {
                    resolve(data.toString());
                }
            });
        });
    }
}
LocalDataProvider.SchemaType = "node-readme-local-data";
exports.LocalDataProvider = LocalDataProvider;
//# sourceMappingURL=localdata.js.map