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
const fs = require("fs-extra");
const path = require("path");
const vscode_uri_1 = require("vscode-uri");
const codeModTypes_1 = require("../codeModTypes");
const astService_1 = require("./astService");
const connectionService_1 = require("./connectionService");
const logService_1 = require("./logService");
const embeddedCodeModDir = path.join(__dirname, '..', 'codemods');
class CodeModService {
    constructor() {
        this._codeModsCache = null;
    }
    reloadAllCodeMods() {
        return __awaiter(this, void 0, void 0, function* () {
            // local code mods
            const files = yield fs.readdir(embeddedCodeModDir);
            const fileNames = files.map(name => path.join(embeddedCodeModDir, name));
            const codeMods = (yield Promise.all(fileNames.map((fileName) => __awaiter(this, void 0, void 0, function* () {
                if (!fileName.match(/(\.ts|\.js)$/)) {
                    return {
                        isFile: false,
                        fileName
                    };
                }
                const stat = yield fs.lstat(fileName);
                return {
                    isFile: stat.isFile(),
                    fileName
                };
            }))))
                .filter(x => x.isFile)
                .map(x => this._parseCodeModFile(x.fileName));
            // user-workspace code mods
            const wsFolders = yield connectionService_1.default.connection().workspace.getWorkspaceFolders();
            if (wsFolders) {
                const codemodDir = connectionService_1.default.getSettings().codemodDir;
                for (let folder of wsFolders) {
                    const folderUri = vscode_uri_1.default.parse(folder.uri);
                    if (folderUri.scheme !== 'file') {
                        continue;
                    }
                    const dirName = path.join(folderUri.fsPath, codemodDir);
                    if (!(yield fs.pathExists(dirName))) {
                        continue;
                    }
                    const names = yield fs.readdir(dirName);
                    for (let n of names) {
                        const fn = path.join(dirName, n);
                        if ((yield fs.stat(fn)).isFile) {
                            codeMods.push(this._parseCodeModFile(fn));
                        }
                    }
                }
            }
            const validCodeMods = codeMods.filter(c => c);
            validCodeMods.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            this._codeModsCache = validCodeMods;
            logService_1.default.output(`${validCodeMods.length} code actions loaded.`);
            return validCodeMods;
        });
    }
    loadOneEmbeddedCodeMod(modId) {
        if (this._codeModsCache && this._codeModsCache.some(m => m.id === modId)) {
            return;
        }
        const fileName = path.join(embeddedCodeModDir, modId);
        const mod = this._parseCodeModFile(fileName);
        if (!mod) {
            throw new Error(`Failed to load the codeMod ${modId} (file: ${fileName}).`);
        }
        if (!this._codeModsCache) {
            this._codeModsCache = [];
        }
        this._codeModsCache.push(mod);
    }
    getGlobalMods(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mods = yield this.getRunnableCodeMods(options);
                return mods.filter(mod => mod.scope === codeModTypes_1.CodeModScope.Global);
            }
            catch (e) {
                logService_1.default.outputError(`Error while executing [getGlobalMods].getRunnableCodeMods(): ${e.toString()}`);
                return [];
            }
        });
    }
    getCodeActionMods(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mods = yield this.getRunnableCodeMods(options);
                return mods.filter(mod => mod.scope === codeModTypes_1.CodeModScope.Cursor);
            }
            catch (e) {
                logService_1.default.outputError(`Error while executing [getCodeActionMods].getRunnableCodeMods(): ${e.toString()}`);
                return [];
            }
        });
    }
    getRunnableCodeMods(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let mods = yield this._getAllCodeMods();
            if (options.include) {
                mods = options.include.map(id => {
                    const mod = mods.find(m => m.id === id);
                    if (!mod) {
                        throw new Error(`Mod ${id} not loaded.`);
                    }
                    return mod;
                });
            }
            if (options.exclude) {
                mods = mods.filter(m => !options.exclude.includes(m.id));
            }
            const jscodeshift = astService_1.default.getCodeShift(options.languageId);
            const ast = astService_1.default.getAstTree(options);
            if (!ast) {
                return [];
            }
            const target = ast.findNodeAtPosition(options.selection.active);
            const stats = () => { };
            return mods.filter(m => {
                const r = m.canRun({
                    path: options.fileName,
                    source: options.source,
                    ast
                }, {
                    jscodeshift,
                    stats
                }, {
                    target,
                    selection: options.selection
                });
                return r;
            });
        });
    }
    executeTransform(modId, options) {
        const mod = this._getCodeMod(modId);
        const jscodeshift = astService_1.default.getCodeShift(options.languageId);
        const ast = astService_1.default.getAstTree(options);
        if (!ast) {
            throw new Error('Syntax error');
        }
        const target = ast.findNodeAtPosition(options.selection.active);
        let result;
        result = mod.modFn({
            path: options.fileName,
            source: options.source,
            ast
        }, {
            jscodeshift,
            stats: () => { }
        }, {
            target,
            selection: options.selection
        });
        astService_1.default.invalidateAstTree(options.fileName);
        if (!result) {
            return {
                source: options.source
            };
        }
        if (typeof result === 'string') {
            return {
                source: result
            };
        }
        else {
            return {
                source: result.source,
                selection: result.selection
            };
        }
    }
    _parseCodeModFile(fileName) {
        let modFn;
        try {
            modFn = require(fileName);
        }
        catch (e) {
            logService_1.default.outputError(`Failed to parse codemod '${fileName}': ${e.message}`);
            return null;
        }
        const name = path.basename(fileName, path.extname(fileName));
        return {
            id: name,
            name: modFn.title || name,
            description: modFn.description || '',
            detail: modFn.detail,
            canRun: modFn.canRun || (() => true),
            scope: modFn.scope || codeModTypes_1.CodeModScope.Global,
            modFn
        };
    }
    _getAllCodeMods() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._codeModsCache) {
                return this._codeModsCache;
            }
            yield this.reloadAllCodeMods();
            return this._codeModsCache;
        });
    }
    _getCodeMod(modId) {
        const mod = this._codeModsCache && this._codeModsCache.find(m => m.id === modId);
        if (!mod) {
            throw new Error(`The requested mod ${modId} is missing in cache.`);
        }
        return mod;
    }
}
exports.default = new CodeModService();
//# sourceMappingURL=codeModService.js.map