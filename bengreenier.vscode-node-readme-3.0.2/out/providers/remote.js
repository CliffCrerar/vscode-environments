"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backoff = require("backoff");
const type_extensions_1 = require("../type-extensions");
const extension_1 = require("../extension");
class RemoteProvider {
    provideTextDocumentContent(uri, token) {
        const rawUri = type_extensions_1.ReadmeUri.from(uri).rawUri;
        const fragSplit = rawUri.fragment.indexOf('.');
        return this.getReadme(rawUri.with({
            scheme: rawUri.fragment.substring(0, fragSplit),
            fragment: rawUri.fragment.substring(fragSplit + 1)
        }).toString()).then((p) => {
            extension_1.TestHook.log(uri.toString());
            return p;
        }, (err) => {
            extension_1.TestHook.err(err);
            return Promise.reject(err);
        });
    }
    getReadme(path) {
        return new Promise((resolve, reject) => {
            let call = backoff.call(extension_1.TestHook.getHttpImpl(), {
                url: path,
                headers: {
                    "User-Agent": "bengreenier/vscode-node-readme"
                }
            }, (err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res.body);
                }
            });
            call.retryIf(function (err) { return err.status !== 200; });
            call.setStrategy(new backoff.ExponentialStrategy());
            call.failAfter(5);
            call.start();
        });
    }
}
RemoteProvider.SchemaType = "node-readme-remote-data";
exports.RemoteProvider = RemoteProvider;
//# sourceMappingURL=remote.js.map