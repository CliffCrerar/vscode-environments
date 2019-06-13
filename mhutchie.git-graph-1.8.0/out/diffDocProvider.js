"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("./utils");
class DiffDocProvider {
    constructor(dataSource) {
        this.onDidChangeEventEmitter = new vscode.EventEmitter();
        this.docs = new Map();
        this.dataSource = dataSource;
        this.subscriptions = vscode.workspace.onDidCloseTextDocument((doc) => this.docs.delete(doc.uri.toString()));
    }
    dispose() {
        this.subscriptions.dispose();
        this.docs.clear();
        this.onDidChangeEventEmitter.dispose();
    }
    get onDidChange() {
        return this.onDidChangeEventEmitter.event;
    }
    provideTextDocumentContent(uri) {
        let document = this.docs.get(uri.toString());
        if (document)
            return document.value;
        let request = decodeDiffDocUri(uri);
        return this.dataSource.getCommitFile(request.repo, request.commit, request.filePath, request.type, request.diffSide).then((contents) => {
            let document = new DiffDocument(contents);
            this.docs.set(uri.toString(), document);
            return document.value;
        }, (errorMessage) => {
            vscode.window.showErrorMessage('Unable to retrieve file: ' + errorMessage);
            return '';
        });
    }
}
DiffDocProvider.scheme = 'git-graph';
exports.DiffDocProvider = DiffDocProvider;
class DiffDocument {
    constructor(body) {
        this.body = body;
    }
    get value() {
        return this.body;
    }
}
function encodeDiffDocUri(repo, path, commit, type, diffSide) {
    return commit === utils_1.UNCOMMITTED && type !== 'D'
        ? vscode.Uri.file(repo + '/' + path)
        : vscode.Uri.parse(DiffDocProvider.scheme + ':' + utils_1.getPathFromStr(path) + '?commit=' + encodeURIComponent(commit) + '&type=' + type + '&diffSide=' + diffSide + '&repo=' + encodeURIComponent(repo));
}
exports.encodeDiffDocUri = encodeDiffDocUri;
function decodeDiffDocUri(uri) {
    let queryArgs = decodeUriQueryArgs(uri.query);
    return { filePath: uri.path, commit: queryArgs.commit, type: queryArgs.type, diffSide: queryArgs.diffSide, repo: queryArgs.repo };
}
exports.decodeDiffDocUri = decodeDiffDocUri;
function decodeUriQueryArgs(query) {
    let queryComps = query.split('&'), queryArgs = {}, i;
    for (i = 0; i < queryComps.length; i++) {
        let pair = queryComps[i].split('=');
        queryArgs[pair[0]] = decodeURIComponent(pair[1]);
    }
    return queryArgs;
}
//# sourceMappingURL=diffDocProvider.js.map