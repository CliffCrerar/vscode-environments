'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("mz/fs");
const path = require("path");
const VsprojUtil = require("./vsproj");
const StatusBar = require("./statusbar");
const vsprojOutput_1 = require("./vsprojOutput");
const { window, commands, workspace } = vscode;
const debounce = require('lodash.debounce');
const _debounceDeleteTime = 2000;
let _vsprojRemovals = [];
let workspaceParentFolders;
const _disposables = [];
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = getGlobalConfig();
        //Gobal activation
        if (!config.get('enabled', true))
            return;
        //Workspace activation
        if (!config.get('activate', false))
            return;
        if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
            return;
        }
        _disposables.push(yield vsprojOutput_1.VsProjOutput.CreateChannel());
        const projExt = config.get('projExtension', 'njsproj');
        vsprojOutput_1.VsProjOutput.AppendLine('extension.vsproj#activate for', projExt);
        const vsprojWatcher = workspace.createFileSystemWatcher(`**/*.${projExt}`);
        const deleteFileWatcher = workspace.createFileSystemWatcher('**/*', true, true, false);
        const createAndChangeFileWatcher = workspace.createFileSystemWatcher('**/*', false, false, true);
        context.subscriptions.push(commands.registerCommand('extension.vsproj.output', () => {
            //Show debug output console
            vsprojOutput_1.VsProjOutput.Show();
        }), commands.registerCommand('extension.vsproj.add', vsprojAddCommand.bind(context)), commands.registerCommand('extension.vsproj.remove', vsprojRemoveCommand.bind(context)), commands.registerCommand('extension.vsproj.clearIgnoredPaths', clearIgnoredPathsCommand.bind(context)), workspace.onDidSaveTextDocument((e) => __awaiter(this, void 0, void 0, function* () {
            if (ignoreEvent(context, e.uri))
                return;
            yield commands.executeCommand('extension.vsproj.add', e.uri);
        })), window.onDidChangeActiveTextEditor((e) => __awaiter(this, void 0, void 0, function* () {
            if (!e)
                return;
            if (ignoreEvent(context, e.document.uri))
                return;
            yield commands.executeCommand('extension.vsproj.add', e.document.uri);
        })), vsprojWatcher.onDidChange((uri) => {
            // Clear cache entry if file is modified
            VsprojUtil.invalidate(uri.fsPath);
        }), createAndChangeFileWatcher.onDidCreate((uri) => __awaiter(this, void 0, void 0, function* () {
            if (ignoreEvent(context, uri))
                return;
            yield commands.executeCommand('extension.vsproj.add', uri);
        })), createAndChangeFileWatcher.onDidChange((uri) => __awaiter(this, void 0, void 0, function* () {
            if (ignoreEvent(context, uri))
                return;
            const isFileExisting = yield fileExists(uri.fsPath);
            if (!isFileExisting) {
                //File has been renamed, so remove it
                yield commands.executeCommand('extension.vsproj.remove', uri);
            }
        })), deleteFileWatcher.onDidDelete((uri) => __awaiter(this, void 0, void 0, function* () {
            if (ignoreEvent(context, uri))
                return;
            yield handleFileDeletion(uri);
        })), vsprojWatcher, deleteFileWatcher, StatusBar.createItem(projExt, workspace.workspaceFolders));
    });
}
exports.activate = activate;
function getWorkspaceParentFolders() {
    if (workspaceParentFolders) {
        return (workspaceParentFolders);
    }
    workspaceParentFolders = [];
    if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
        return (workspaceParentFolders);
    }
    workspace.workspaceFolders.forEach(f => {
        workspaceParentFolders.push(path.resolve(f.uri.fsPath, '..'));
    });
    return (workspaceParentFolders);
}
function deactivate() {
    vsprojOutput_1.VsProjOutput.AppendLine('extension.vsproj#deactivate');
    VsprojUtil.invalidateAll();
    StatusBar.hideItem();
    _disposables.forEach(d => d.dispose());
}
exports.deactivate = deactivate;
function ignoreEvent(context, uri) {
    if (!isDesiredFile(context.globalState, uri.fsPath))
        return true;
    return false;
}
function getGlobalConfig() {
    return workspace.getConfiguration("vsproj");
}
const getProjExtension = () => {
    return getGlobalConfig().get('projExtension', 'njsproj');
};
function vsprojAddCommand(
// Use file path from context or fall back to active document
uri = window.activeTextEditor ? window.activeTextEditor.document.uri : null, bulkMode = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uri || !uri.fsPath)
            return;
        const fsPath = uri.fsPath;
        const projExt = getProjExtension();
        // Skip if we're saving a *proj file, or we are a standalone file without a path.
        if (fsPath.endsWith(`.${projExt}`) || !/(\/|\\)/.test(fsPath))
            return;
        removeFromPendingDelete(fsPath);
        if (isDirectory(fsPath)) {
            return yield vsprojAddDirectory.call(this, fsPath);
        }
        return yield processAddCommand.call(this, fsPath, bulkMode === true);
    });
}
/**
 * Prevent removing a file that is delete then added in the same process (with SCM for instance)
 * @param fsPath - Path to remove from pending delete
 */
function removeFromPendingDelete(fsPath) {
    const index = _vsprojRemovals.findIndex(path => path === fsPath);
    if (index >= 0) {
        _vsprojRemovals.splice(index, 1);
    }
}
function processAddCommand(fsPath, bulkMode = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = path.basename(fsPath);
        vsprojOutput_1.VsProjOutput.AppendLine(`extension.vsproj#trigger(${fileName})#add`);
        try {
            const vsproj = yield getVsprojForFile(fsPath);
            if (!vsproj)
                return;
            if (VsprojUtil.hasFile(vsproj, fsPath)) {
                vsprojOutput_1.VsProjOutput.AppendLine(`extension.vsproj#trigger(${fileName}): already in proj file`);
                return;
            }
            vsprojOutput_1.VsProjOutput.AppendLine(`extension.vsproj#trigger(${fileName}): add file`);
            const added = yield runAction({
                filePath: fsPath,
                fileName,
                bulkMode,
                vsproj,
                globalState: this.globalState
            });
            if (added)
                return vsproj;
        }
        catch (err) {
            if (!(err instanceof VsprojUtil.NoVsprojError)) {
                console.trace(err);
                vsprojOutput_1.VsProjOutput.AppendLine(err);
            }
            else {
                vsprojOutput_1.VsProjOutput.AppendLine(`extension.vsproj#trigger(${fileName}): no project file found`);
            }
        }
    });
}
;
function runAction({ filePath, fileName, vsproj, bulkMode }) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = getGlobalConfig();
        const itemType = config.get('itemType', {
            '*': 'Content',
            '.js': 'Compile',
            '.ts': 'TypeScriptCompile'
        });
        VsprojUtil.addFile(vsproj, filePath, getTypeForFile(fileName, itemType));
        if (!bulkMode) {
            yield saveVsProj(vsproj);
        }
        return true;
    });
}
function vsprojAddDirectory(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const changedVsprojs = [];
        if (!isDesiredFile(this.globalState, fsPath)) {
            return;
        }
        const relativePattern = new vscode.RelativePattern(fsPath, '**/*');
        const files = yield workspace.findFiles(relativePattern, '**/node_modules/**');
        const hasFiles = files.length > 0;
        //Add directory itself
        let vsproj = yield processAddCommand.call(this, fsPath, false, hasFiles);
        if (vsproj) {
            changedVsprojs.push(vsproj);
        }
        //Add files/directories inside directory
        for (const file of files.filter(file => isDesiredFile(this.globalState, file.fsPath))) {
            vsproj = yield vsprojAddCommand.call(this, file, true);
            if (vsproj) {
                if (!changedVsprojs.find(_vsproj => _vsproj.fsPath === vsproj.fsPath))
                    changedVsprojs.push(vsproj);
            }
        }
        for (const vsproj of changedVsprojs)
            yield saveVsProj(vsproj);
    });
}
// How do we actually tell if a directory or file was deleted?
function wasDirectory(fsPath) {
    return path.extname(fsPath) === '' && !fsPath.startsWith(".");
}
function isDirectory(fsPath) {
    return (fs.lstatSync(fsPath).isDirectory());
}
function fileExists(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            fs.access(fsPath, fs.constants.F_OK, (err) => {
                if (err) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    });
}
function handleFileDeletion({ fsPath }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const vsproj = yield getVsprojForFile(fsPath);
            if (!vsproj)
                return;
            const fileName = path.basename(fsPath);
            vsprojOutput_1.VsProjOutput.AppendLine(`extension.vsproj#trigger(${fileName}) : will be deleted`);
            if (!wasDirectory(fsPath) && !VsprojUtil.hasFile(vsproj, fsPath))
                return;
            _vsprojRemovals.push(fsPath);
            yield debouncedRemoveFromVsproj(_vsprojRemovals, () => { _vsprojRemovals = []; });
        }
        catch (err) {
            console.trace(err);
            vsprojOutput_1.VsProjOutput.AppendLine(err);
        }
    });
}
const debouncedRemoveFromVsproj = debounce((removals, onCall) => __awaiter(this, void 0, void 0, function* () {
    onCall();
    for (let filePath of removals) {
        yield commands.executeCommand('extension.vsproj.remove', { fsPath: filePath });
    }
}), _debounceDeleteTime);
function getTypeForFile(fileName, itemType) {
    const extension = path.extname(fileName) || (fileName.startsWith(".") ? "file" : "");
    return typeof itemType === 'string'
        ? itemType
        : !extension ? "Folder" : (itemType[extension] || itemType['*'] || 'Content');
}
function isDesiredFile(globalState, queryPath) {
    const ignorePaths = globalState.get('vsproj.ignorePaths') || [];
    if (ignorePaths.indexOf(queryPath) > -1)
        return false;
    const config = getGlobalConfig();
    const includeRegex = config.get('includeRegex', '.*');
    //Global exclusions
    const excludeRegex = config.get('excludeRegex', null);
    if (includeRegex != null && !new RegExp(includeRegex).test(queryPath))
        return false;
    if (excludeRegex != null && new RegExp(excludeRegex).test(queryPath))
        return false;
    //Exclusions by workspace
    const excludeList = config.get('exclude', []);
    return excludeList.every(excludeValue => {
        return !new RegExp(excludeValue).test(queryPath);
    });
}
function clearIgnoredPathsCommand() {
    this.globalState.update('vsproj.ignorePaths', []);
}
function updateIgnoredPaths(globalState, addPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const list = globalState.get('vsproj.ignorePaths') || [];
        list.push(addPath);
        yield globalState.update('vsproj.ignorePaths', list);
    });
}
function vsprojRemoveCommand(
// Use file path from context or fall back to active document
uri = window.activeTextEditor ? window.activeTextEditor.document.uri : null, bulkMode = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uri || !uri.fsPath) {
            return;
        }
        const fsPath = uri.fsPath;
        const vsproj = yield getVsprojForFile(fsPath);
        if (!vsproj)
            return;
        const wasDir = wasDirectory(fsPath);
        const fileName = path.basename(fsPath);
        vsprojOutput_1.VsProjOutput.AppendLine(`extension.vsproj#remove(${fsPath})`);
        try {
            const removed = yield VsprojUtil.removeFile(vsproj, fsPath, wasDir);
            yield saveVsProj(vsproj);
            if (!removed && bulkMode !== true) {
                vsprojOutput_1.VsProjOutput.AppendLine(`${fileName} was not found in ${vsproj.name}`);
            }
        }
        catch (err) {
            console.trace(err);
            vsprojOutput_1.VsProjOutput.AppendLine(err);
        }
    });
}
function getVsprojForFile(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projExt = getProjExtension();
            return yield VsprojUtil.getProjforFile(fsPath, projExt, getWorkspaceParentFolders());
        }
        catch (err) {
            if (err instanceof VsprojUtil.NoVsprojError) {
                const fileName = path.basename(fsPath);
                vsprojOutput_1.VsProjOutput.AppendLine(`Unable to locate vsproj for file: ${fileName}`);
            }
            else {
                console.trace(err);
                vsprojOutput_1.VsProjOutput.AppendLine(err);
            }
            return;
        }
    });
}
function saveVsProj(vsproj) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield VsprojUtil.persist(vsproj, getGlobalConfig().get('encoding'));
    });
}
//# sourceMappingURL=extension.js.map