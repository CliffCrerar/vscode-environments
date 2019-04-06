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
     * Indicates if there's something able to be stashed.
     */
    isStashable() {
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
            const modifiedFiles = (yield this.exec(paramsModifiedAndDeleted)).trim().length > 0;
            const untrackedFiles = (yield this.exec(paramsUntracked)).trim().length > 0;
            const stagedFiles = (yield this.exec(paramsStaged)).trim().length > 0;
            return modifiedFiles || untrackedFiles || stagedFiles;
        });
    }
    /**
     * Gets the raw git stash command data.
     */
    getRawStash() {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'stash',
                'list'
            ];
            return (yield this.exec(params)).trim();
        });
    }
    /**
     * Gets the stash entries list.
     */
    getStashList() {
        return __awaiter(this, void 0, void 0, function* () {
            const validFormats = ['default', 'iso', 'local', 'raw', 'relative', 'rfc', 'short'];
            const dateFormat = vscode_1.workspace.getConfiguration('gitstash').dateFormat;
            const params = [
                'stash',
                'list',
                '--date=' + (validFormats.indexOf(dateFormat) > -1 ? dateFormat : 'default')
            ];
            const stashList = (yield this.exec(params)).trim();
            const list = [];
            if (stashList.length > 0) {
                stashList.split(/\r?\n/g).forEach((entry, index) => {
                    list.push({
                        index: index,
                        description: entry.substring(entry.indexOf('}:') + 2).trim(),
                        date: entry.substring(entry.indexOf('{') + 1, entry.indexOf('}'))
                    });
                });
            }
            return list;
        });
    }
    /**
     * Gets the files of a stash entry.
     *
     * @param index the int with the index of the stash entry
     */
    getStashedFiles(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryFiles = {
                untracked: yield this.getStashUntracked(index),
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
            const stashData = (yield this.exec(params)).trim();
            stashData.split(/\r?\n/g).forEach((line) => {
                const fileSummary = line.match(/\s*(.+)\s+(.+)\s+(.+)\s+(.+)/);
                if (fileSummary !== null) {
                    const stat = fileSummary[1].toLowerCase();
                    const file = fileSummary[4];
                    if (stat === 'create') {
                        entryFiles.indexAdded.push(file);
                    }
                    else if (stat === 'delete') {
                        entryFiles.deleted.push(file);
                    }
                }
            });
            stashData.split(/\r?\n/g).forEach((line) => {
                const fileStats = line.match(/(\s*\d+\s+\d+\s+(.+))|(\s*-\s+-\s+(.+))/);
                if (fileStats !== null) {
                    const file = fileStats[2] || fileStats[4];
                    if (entryFiles.indexAdded.indexOf(file) !== -1) {
                        return;
                    }
                    if (entryFiles.deleted.indexOf(file) !== -1) {
                        return;
                    }
                    entryFiles.modified.push(file);
                }
            });
            return entryFiles;
        });
    }
    /**
     * Gets the untracked files of a stash entry.
     *
     * @param index the int with the index of the stash entry
     */
    getStashUntracked(index) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'ls-tree',
                '-r',
                `stash@{${index}}^3`,
                '--name-only'
            ];
            const list = [];
            try {
                const untrackedFiles = (yield this.exec(params)).trim();
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
     * @param index the int with the index of the parent stash
     * @param file  the string with the stashed file name
     */
    getStashFileContents(index, file) {
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
                base: yield this.call(paramsBase),
                modified: yield this.call(paramsModified)
            };
        });
    }
    /**
     * Gets the file contents of an untracked file.
     *
     * @param index the int with the index of the parent stash
     * @param file  the string with the stashed file name
     */
    untrackedFileContents(index, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'show',
                `stash@{${index}}^3:${file}`
            ];
            return yield this.call(params);
        });
    }
    /**
     * Gets the file contents of an index added file.
     *
     * @param index the int with the index of the parent stash
     * @param file  the string with the stashed file name
     */
    indexAddedFileContents(index, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'show',
                `stash@{${index}}:${file}`
            ];
            return yield this.call(params);
        });
    }
    /**
     * Gets the file contents of a deleted file.
     *
     * @param index the int with the index of the parent stash
     * @param file  the string with the stashed file name
     */
    deletedFileContents(index, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'show',
                `stash@{${index}}^1:${file}`
            ];
            return yield this.call(params);
        });
    }
}
exports.default = StashGit;
//# sourceMappingURL=StashGit.js.map