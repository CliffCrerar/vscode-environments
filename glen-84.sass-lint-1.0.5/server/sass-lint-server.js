"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const fs_1 = __importDefault(require("fs"));
const globule_1 = __importDefault(require("globule"));
const path_1 = __importDefault(require("path"));
const vscode_uri_1 = __importDefault(require("vscode-uri"));
// Create a connection for the server. The connection uses Node's IPC as a transport.
const connection = vscode_languageserver_1.createConnection(vscode_languageserver_1.ProposedFeatures.all);
// Create a simple text document manager. The text document manager supports full document sync only.
const documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection for open, change, and close text document events.
documents.listen(connection);
class SettingsCache {
    constructor() {
        this.uri = undefined;
        this.promise = undefined;
    }
    get(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (uri === this.uri) {
                trace(`SettingsCache: cache hit for: ${this.uri}`);
                // tslint:disable-next-line:no-non-null-assertion
                return this.promise;
            }
            if (hasConfigurationCapability) {
                this.uri = uri;
                return this.promise = new Promise((resolve, _reject) => __awaiter(this, void 0, void 0, function* () {
                    trace(`SettingsCache: cache updating for: ${this.uri}`);
                    const configRequestParam = { items: [{ scopeUri: uri, section: "sasslint" }] };
                    // tslint:disable-next-line:await-promise
                    const settings = yield connection.sendRequest(vscode_languageserver_1.ConfigurationRequest.type, configRequestParam);
                    resolve(settings[0]);
                }));
            }
            this.promise = Promise.resolve(globalSettings);
            return this.promise;
        });
    }
    flush() {
        this.uri = undefined;
        this.promise = undefined;
    }
}
let workspaceFolders;
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let globalSettings;
const settingsCache = new SettingsCache();
// Map stores undefined values to represent failed resolutions.
const globalPackageManagerPath = new Map();
const path2Library = new Map();
const document2Library = new Map();
let configPathCache = {};
// tslint:disable-next-line:no-namespace
var NoSassLintLibraryRequest;
(function (NoSassLintLibraryRequest) {
    NoSassLintLibraryRequest.type = new vscode_languageserver_1.RequestType("sass-lint/noLibrary");
})(NoSassLintLibraryRequest || (NoSassLintLibraryRequest = {}));
function trace(message, verbose) {
    connection.tracer.log(message, verbose);
}
connection.onInitialize((params) => {
    trace("onInitialize");
    if (params.workspaceFolders) {
        workspaceFolders = params.workspaceFolders;
        // Sort folders.
        sortWorkspaceFolders();
    }
    const capabilities = params.capabilities;
    hasWorkspaceFolderCapability = Boolean(capabilities.workspace && capabilities.workspace.workspaceFolders);
    hasConfigurationCapability = Boolean(capabilities.workspace && capabilities.workspace.configuration);
    return {
        capabilities: {
            textDocumentSync: documents.syncKind
        }
    };
});
connection.onInitialized(() => {
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders((event) => {
            trace("onDidChangeWorkspaceFolders");
            // Removed folders.
            for (const workspaceFolder of event.removed) {
                const index = workspaceFolders.findIndex((folder) => folder.uri === workspaceFolder.uri);
                if (index !== -1) {
                    workspaceFolders.splice(index, 1);
                }
            }
            // Added folders.
            for (const workspaceFolder of event.added) {
                workspaceFolders.push(workspaceFolder);
            }
            // Sort folders.
            sortWorkspaceFolders();
        });
    }
});
function sortWorkspaceFolders() {
    workspaceFolders.sort((folder1, folder2) => {
        let uri1 = folder1.uri.toString();
        let uri2 = folder2.uri.toString();
        if (!uri1.endsWith("/")) {
            uri1 += path_1.default.sep;
        }
        if (uri2.endsWith("/")) {
            uri2 += path_1.default.sep;
        }
        return (uri1.length - uri2.length);
    });
}
documents.onDidOpen((event) => __awaiter(this, void 0, void 0, function* () {
    trace(`onDidOpen: ${event.document.uri}`);
    yield validateTextDocument(event.document);
}));
// The content of a text document has changed.
// This event is emitted when the text document is first opened or when its content has changed.
documents.onDidChangeContent((event) => __awaiter(this, void 0, void 0, function* () {
    trace(`onDidChangeContent: ${event.document.uri}`);
    const settings = yield settingsCache.get(event.document.uri);
    if (settings && settings.run === "onType") {
        yield validateTextDocument(event.document);
    }
    else if (settings && settings.run === "onSave") {
        // Clear the diagnostics when validating on save and when the document is modified.
        connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
    }
}));
documents.onDidSave((event) => __awaiter(this, void 0, void 0, function* () {
    trace(`onDidSave: ${event.document.uri}`);
    const settings = yield settingsCache.get(event.document.uri);
    if (settings && settings.run === "onSave") {
        yield validateTextDocument(event.document);
    }
}));
// A text document was closed.
documents.onDidClose((event) => {
    trace(`onDidClose: ${event.document.uri}`);
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
    document2Library.delete(event.document.uri);
    // tslint:disable-next-line:no-dynamic-delete -- TODO: Refactor to use a map.
    delete configPathCache[vscode_uri_1.default.parse(event.document.uri).fsPath];
});
function loadLibrary(docUri) {
    return __awaiter(this, void 0, void 0, function* () {
        trace(`loadLibrary for: ${docUri}`);
        const uri = vscode_uri_1.default.parse(docUri);
        let promise;
        const settings = yield settingsCache.get(docUri);
        const getGlobalPath = () => getGlobalPackageManagerPath(settings.packageManager);
        if (uri.scheme === "file") {
            const file = uri.fsPath;
            const directory = path_1.default.dirname(file);
            let nodePath;
            if (settings && settings.nodePath) {
                // TODO: https://github.com/Microsoft/vscode-languageserver-node/issues/475
                const exists = fs_1.default.existsSync(settings.nodePath);
                if (exists) {
                    nodePath = settings.nodePath;
                }
                else {
                    connection.window.showErrorMessage(`The setting 'sasslint.nodePath' refers to '${settings.nodePath}', but this path does not exist. ` +
                        "The setting will be ignored.");
                }
            }
            if (nodePath) {
                promise = vscode_languageserver_1.Files.resolve("sass-lint", nodePath, nodePath, trace).then(undefined, () => vscode_languageserver_1.Files.resolve("sass-lint", getGlobalPath(), directory, trace));
            }
            else {
                promise = vscode_languageserver_1.Files.resolve("sass-lint", getGlobalPath(), directory, trace);
            }
        }
        else {
            promise = vscode_languageserver_1.Files.resolve("sass-lint", getGlobalPath(), undefined, trace);
        }
        document2Library.set(docUri, promise.then((libraryPath) => {
            let library;
            if (!path2Library.has(libraryPath)) {
                library = require(libraryPath);
                trace(`sass-lint library loaded from: ${libraryPath}`);
                path2Library.set(libraryPath, library);
            }
            return path2Library.get(libraryPath);
        }, () => {
            connection.sendRequest(NoSassLintLibraryRequest.type, { source: { uri: docUri } });
        }));
    });
}
function validateTextDocument(document) {
    return __awaiter(this, void 0, void 0, function* () {
        const docUri = document.uri;
        trace(`validateTextDocument: ${docUri}`);
        // Sass Lint can only lint files on disk.
        if (vscode_uri_1.default.parse(docUri).scheme !== "file") {
            return;
        }
        const settings = yield settingsCache.get(docUri);
        if (settings && !settings.enable) {
            return;
        }
        if (!document2Library.has(document.uri)) {
            yield loadLibrary(document.uri);
        }
        if (!document2Library.has(document.uri)) {
            return;
        }
        // tslint:disable-next-line:await-promise
        const library = yield document2Library.get(document.uri);
        if (library) {
            try {
                const diagnostics = yield doValidate(library, document);
                connection.sendDiagnostics({ uri: docUri, diagnostics });
            }
            catch (err) {
                connection.window.showErrorMessage(getErrorMessage(err, document));
            }
        }
    });
}
function validateAllTextDocuments(textDocuments) {
    return __awaiter(this, void 0, void 0, function* () {
        const tracker = new vscode_languageserver_1.ErrorMessageTracker();
        for (const document of textDocuments) {
            try {
                yield validateTextDocument(document);
            }
            catch (err) {
                tracker.add(getErrorMessage(err, document));
            }
        }
        tracker.sendErrors(connection);
    });
}
function doValidate(library, document) {
    return __awaiter(this, void 0, void 0, function* () {
        trace(`doValidate: ${document.uri}`);
        const diagnostics = [];
        const docUri = document.uri;
        const uri = vscode_uri_1.default.parse(docUri);
        if (vscode_uri_1.default.parse(docUri).scheme !== "file") {
            // Sass Lint can only lint files on disk.
            trace("No linting: file is not saved on disk");
            return diagnostics;
        }
        const settings = yield settingsCache.get(docUri);
        if (!settings) {
            trace("No linting: settings could not be loaded");
            return diagnostics;
        }
        if (settings.workspaceFolderPath) {
            trace(`Changed directory to ${settings.workspaceFolderPath}`);
            process.chdir(settings.workspaceFolderPath);
        }
        const configFile = yield getConfigFile(docUri);
        trace(`Config file: ${configFile}`);
        const compiledConfig = library.getConfig({}, configFile);
        const filePath = uri.fsPath;
        let relativePath;
        if (configFile && settings.resolvePathsRelativeToConfig) {
            relativePath = path_1.default.relative(path_1.default.dirname(configFile), filePath);
        }
        else {
            relativePath = getWorkspaceRelativePath(filePath);
        }
        trace(`Absolute path: ${filePath}`);
        trace(`Relative path: ${relativePath}`);
        if (globule_1.default.isMatch(compiledConfig.files.include, relativePath) &&
            !globule_1.default.isMatch(compiledConfig.files.ignore, relativePath)) {
            const result = library.lintText({
                text: document.getText(),
                format: path_1.default.extname(filePath).slice(1),
                filename: filePath
            }, {}, configFile);
            for (const msg of result.messages) {
                diagnostics.push(makeDiagnostic(msg));
            }
        }
        else {
            trace(`No linting: file "${relativePath}" is excluded`);
        }
        return diagnostics;
    });
}
function getConfigFile(docUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = vscode_uri_1.default.parse(docUri).fsPath;
        let configFile = configPathCache[filePath];
        if (configFile) {
            trace(`Config path cache hit for: ${filePath}`);
            return configFile;
        }
        else {
            trace(`Config path cache miss for: ${filePath}`);
            const dirName = path_1.default.dirname(filePath);
            const configFileNames = [".sass-lint.yml", ".sasslintrc"];
            for (const configFileName of configFileNames) {
                configFile = locateFile(dirName, configFileName);
                if (configFile) {
                    // Cache.
                    configPathCache[filePath] = configFile;
                    return configFile;
                }
            }
        }
        const settings = yield settingsCache.get(docUri);
        if (settings && settings.configFile) {
            // Cache.
            configPathCache[filePath] = settings.configFile;
            return settings.configFile;
        }
        return null;
    });
}
function locateFile(directory, fileName) {
    let parent = directory;
    do {
        directory = parent;
        const location = path_1.default.join(directory, fileName);
        try {
            fs_1.default.accessSync(location, fs_1.default.constants.R_OK);
            return location;
        }
        catch (e) {
            // Do nothing.
        }
        parent = path_1.default.dirname(directory);
    } while (parent !== directory);
    return null;
}
function getWorkspaceRelativePath(filePath) {
    if (workspaceFolders) {
        for (const workspaceFolder of workspaceFolders) {
            let folderPath = vscode_uri_1.default.parse(workspaceFolder.uri).fsPath;
            if (!folderPath.endsWith("/")) {
                folderPath += path_1.default.sep;
            }
            if (folderPath && filePath.startsWith(folderPath)) {
                return path_1.default.relative(folderPath, filePath);
            }
        }
    }
    return filePath;
}
function makeDiagnostic(msg) {
    let severity;
    switch (msg.severity) {
        case 1:
            severity = vscode_languageserver_1.DiagnosticSeverity.Warning;
            break;
        case 2:
            severity = vscode_languageserver_1.DiagnosticSeverity.Error;
            break;
        default:
            severity = vscode_languageserver_1.DiagnosticSeverity.Information;
            break;
    }
    let line;
    if (msg.line) {
        line = msg.line - 1;
    }
    else {
        line = 0;
    }
    let column;
    if (msg.column) {
        column = msg.column - 1;
    }
    else {
        column = 0;
    }
    let message;
    if (msg.message) {
        message = msg.message;
    }
    else {
        message = "Unknown error.";
    }
    return {
        severity,
        range: {
            start: { line, character: column },
            end: { line, character: column + 1 }
        },
        message,
        source: "sass-lint",
        code: msg.ruleId
    };
}
function getErrorMessage(err, document) {
    let errorMessage = "unknown error";
    if (typeof err.message === "string" || err.message instanceof String) {
        errorMessage = err.message;
    }
    const fsPath = vscode_uri_1.default.parse(document.uri).fsPath;
    const message = `vscode-sass-lint: '${errorMessage}' while validating: ${fsPath} stacktrace: ${err.stack}`;
    return message;
}
function getGlobalPackageManagerPath(packageManager) {
    trace(`Begin - resolve global package manager path for: ${packageManager}`);
    if (!globalPackageManagerPath.has(packageManager)) {
        let packageManagerPath;
        if (packageManager === "npm") {
            packageManagerPath = vscode_languageserver_1.Files.resolveGlobalNodePath(trace);
        }
        else if (packageManager === "yarn") {
            packageManagerPath = vscode_languageserver_1.Files.resolveGlobalYarnPath(trace);
        }
        // tslint:disable-next-line:no-non-null-assertion
        globalPackageManagerPath.set(packageManager, packageManagerPath);
    }
    trace(`Done - resolve global package manager path for: ${packageManager}`);
    return globalPackageManagerPath.get(packageManager);
}
// The settings have changed. Sent on server activation as well.
connection.onDidChangeConfiguration((params) => __awaiter(this, void 0, void 0, function* () {
    globalSettings = params.settings;
    // Clear cache.
    configPathCache = {};
    settingsCache.flush();
    // Revalidate any open text documents.
    yield validateAllTextDocuments(documents.all());
}));
connection.onDidChangeWatchedFiles(() => __awaiter(this, void 0, void 0, function* () {
    // Clear cache.
    configPathCache = {};
    yield validateAllTextDocuments(documents.all());
}));
// Listen on the connection.
connection.listen();
//# sourceMappingURL=sass-lint-server.js.map