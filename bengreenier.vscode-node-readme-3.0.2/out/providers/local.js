"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const type_extensions_1 = require("../type-extensions");
const extension_1 = require("../extension");
class LocalProvider {
    provideTextDocumentContent(uri, token) {
        const rawUri = type_extensions_1.ReadmeUri.from(uri).rawUri;
        const authDriveLetter = rawUri.authority ? rawUri.authority + '\\' : '';
        return this.getReadme(`${authDriveLetter}${rawUri.fsPath}`).then((p) => {
            extension_1.TestHook.log(uri.toString());
            return p;
        }, (err) => {
            extension_1.TestHook.err(err);
            return Promise.reject(err);
        });
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
LocalProvider.SchemaType = "node-readme-local-data";
exports.LocalProvider = LocalProvider;
//# sourceMappingURL=local.js.map