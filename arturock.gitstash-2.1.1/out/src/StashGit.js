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
const vscode_1 = require("vscode");
const Git_1 = require("./Git");
class StashGit extends Git_1.default {
    /**
     * Gets the raw git stash command data.
     *
     * @param cwd the current working directory
     */
    getRawStash(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'stash',
                'list'
            ];
            return (yield this.exec(params, cwd)).trim();
        });
    }
    /**
     * Indicates if there's something able to be stashed.
     *
     * @param cwd the current working directory
     */
    isStashable(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const paramsModifiedAndDeleted = [
                'diff',
                '--name-only'
            ];
            const paramsUntracked = [
                'ls-files',
                '--others',
                '--exclude-standard'
            ];
            const paramsStaged = [
                'diff',
                '--cached',
                '--name-only'
            ];
            const modifiedFiles = yield this.exec(paramsModifiedAndDeleted, cwd);
            const untrackedFiles = yield this.exec(paramsUntracked, cwd);
            const stagedFiles = yield this.exec(paramsStaged, cwd);
            return modifiedFiles.trim().length > 0
                || untrackedFiles.trim().length > 0
                || stagedFiles.trim().length > 0;
        });
    }
    /**
     * Gets the stashes list.
     *
     * @param cwd the current working directory
     */
    getStashes(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const validFormats = ['default', 'iso', 'local', 'raw', 'relative', 'rfc', 'short'];
            const dateFormat = vscode_1.workspace.getConfiguration('gitstash').dateFormat;
            const params = [
                'stash',
                'list',
                '--date=' + (validFormats.indexOf(dateFormat) > -1 ? dateFormat : 'default')
            ];
            const stashList = (yield this.exec(params, cwd)).trim();
            const list = [];
            if (stashList.length > 0) {
                stashList.split(/\r?\n/g).forEach((stash, index) => {
                    list.push({
                        index: index,
                        description: stash.substring(stash.indexOf('}:') + 2).trim(),
                        date: stash.substring(stash.indexOf('{') + 1, stash.indexOf('}'))
                    });
                });
            }
            return list;
        });
    }
    /**
     * Gets the stash files.
     *
     * @param cwd   the current working directory
     * @param index the int with the stash index
     */
    getStashedFiles(cwd, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = {
                untracked: yield this.getStashUntracked(cwd, index),
                indexAdded: [],
                modified: [],
                deleted: []
            };
            const params = [
                'stash',
                'show',
                '--numstat',
                '--summary',
                `stash@{${index}}`
            ];
            const stashData = (yield this.exec(params, cwd)).trim();
            stashData.split(/\r?\n/g).forEach((line) => {
                const fileSummary = line.match(/\s*(.+)\s+(.+)\s+(.+)\s+(.+)/);
                if (fileSummary !== null) {
                    const stat = fileSummary[1].toLowerCase();
                    const file = fileSummary[4];
                    if (stat === 'create') {
                        files.indexAdded.push(file);
                    }
                    else if (stat === 'delete') {
                        files.deleted.push(file);
                    }
                }
            });
            stashData.split(/\r?\n/g).forEach((line) => {
                const fileStats = line.match(/(\s*\d+\s+\d+\s+(.+))|(\s*-\s+-\s+(.+))/);
                if (fileStats !== null) {
                    const file = fileStats[2] || fileStats[4];
                    if (files.indexAdded.indexOf(file) !== -1) {
                        return;
                    }
                    if (files.deleted.indexOf(file) !== -1) {
                        return;
                    }
                    files.modified.push(file);
                }
            });
            return files;
        });
    }
    /**
     * Gets the stash untracked files.
     *
     * @param cwd   the current working directory
     * @param index the int with the stash index
     */
    getStashUntracked(cwd, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'ls-tree',
                '-r',
                `stash@{${index}}^3`,
                '--name-only'
            ];
            const list = [];
            try {
                const untrackedFiles = (yield this.exec(params, cwd)).trim();
                if (untrackedFiles.length > 0) {
                    untrackedFiles.split(/\r?\n/g).forEach((file) => {
                        list.push(file);
                    });
                }
            }
            catch (e) { }
            return list;
        });
    }
    /**
     * Gets the file contents of both, the base (original) and the modified data.
     *
     * @param cwd   the current working directory
     * @param index the int with the index of the parent stash
     * @param file  the string with the stashed file name
     */
    getStashFileContents(cwd, index, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const paramsModified = [
                'show',
                `stash@{${index}}:${file}`
            ];
            const paramsBase = [
                'show',
                `stash@{${index}}^1:${file}`
            ];
            return {
                base: yield this.call(paramsBase, cwd),
                modified: yield this.call(paramsModified, cwd)
            };
        });
    }
    /**
     * Gets the file contents of an untracked file.
     *
     * @param cwd   the current working directory
     * @param index the int with the index of the parent stash
     * @param file  the string with the stashed file name
     */
    untrackedFileContents(cwd, index, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'show',
                `stash@{${index}}^3:${file}`
            ];
            return yield this.call(params, cwd);
        });
    }
    /**
     * Gets the file contents of an index added file.
     *
     * @param cwd   the current working directory
     * @param index the int with the index of the parent stash
     * @param file  the string with the stashed file name
     */
    indexAddedFileContents(cwd, index, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'show',
                `stash@{${index}}:${file}`
            ];
            return yield this.call(params, cwd);
        });
    }
    /**
     * Gets the file contents of a deleted file.
     *
     * @param cwd   the current working directory
     * @param index the int with the index of the parent stash
     * @param file  the string with the stashed file name
     */
    deletedFileContents(cwd, index, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'show',
                `stash@{${index}}^1:${file}`
            ];
            return yield this.call(params, cwd);
        });
    }
}
exports.default = StashGit;
//# sourceMappingURL=StashGit.js.map