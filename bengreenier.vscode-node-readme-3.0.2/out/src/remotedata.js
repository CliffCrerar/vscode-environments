"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const path = require("path");
class RemoteDataProvider {
    provideTextDocumentContent(uri, token) {
        const uriStr = uri.path.toString();
        return this.getReadme(uriStr.substring(1, uriStr.lastIndexOf(path.sep)));
    }
    getReadme(path) {
        return new Promise((resolve, reject) => {
            request({
                url: path,
                headers: {
                    "User-Agent": "bengreenier/vscode-node-readme"
                }
            }, (err, res, body) => {
                if (err)
                    reject(err);
                else
                    resolve(body);
            });
        });
    }
}
RemoteDataProvider.SchemaType = "node-readme-remote-data";
exports.RemoteDataProvider = RemoteDataProvider;
//# sourceMappingURL=remotedata.js.map