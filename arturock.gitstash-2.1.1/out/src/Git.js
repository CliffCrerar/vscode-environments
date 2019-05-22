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
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const vscode_1 = require("vscode");
class Git {
    /**
     * Executes a git command.
     *
     * @param args the string array with the argument list
     * @param cwd  the optionally string with the current working directory
     */
    call(args, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cwd) {
                cwd = (yield this.getDefaultRoot()) || '';
            }
            const response = [];
            const errors = [];
            const cmd = child_process_1.spawn('git', args, { cwd });
            cmd.stderr.setEncoding('utf8');
            return new Promise((resolve, reject) => {
                cmd.stdout.on('data', (chunk) => response.push(chunk));
                cmd.stdout.on('error', (err) => errors.push(err.message));
                cmd.stderr.on('data', (chunk) => errors.push(chunk));
                cmd.stderr.on('error', (err) => errors.push(err.message));
                cmd.on('close', () => {
                    const bufferResponse = response.length ? Buffer.concat(response) : Buffer.from(new ArrayBuffer(0));
                    errors.length === 0
                        ? resolve(bufferResponse)
                        : reject(`${errors.join(' ')}\n${bufferResponse.toString('utf8')}`.trim());
                });
            });
        });
    }
    /**
     * Executes a git command.
     *
     * @param args     the string array with the argument list
     * @param cwd      the optionally string with the current working directory
     * @param encoding the string with the optional encoding to replace utf8
     */
    exec(args, cwd, encoding) {
        return __awaiter(this, void 0, void 0, function* () {
            return this
                .call(args, cwd)
                .then((data) => {
                return data instanceof Buffer ? data.toString(encoding || 'utf8') : data;
            });
        });
    }
    /**
     * Indicates if there's a current git repository.
     */
    hasGitRepository() {
        return __awaiter(this, void 0, void 0, function* () {
            const repository = yield this.getRepositories(true);
            return repository && repository.length > 0;
        });
    }
    /**
     * Gets the directory to be used as fallback.
     */
    getDefaultRoot() {
        return __awaiter(this, void 0, void 0, function* () {
            const repositories = yield this.getRepositories(true);
            return repositories[0] || null;
        });
    }
    /**
     * Gets the directories for git repositories on the workspace.
     */
    getRepositories(firstOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [
                'rev-parse',
                '--show-toplevel'
            ];
            const paths = [];
            for (const cwd of this.getWorkspacePaths()) {
                let gitPath;
                try {
                    gitPath = (yield this.exec(params, cwd)).trim();
                }
                catch (e) {
                    continue;
                }
                if (paths.indexOf(gitPath) === -1) {
                    paths.push(gitPath);
                }
                if (firstOnly) {
                    break;
                }
            }
            return paths;
        });
    }
    /**
     * Gets the workspace directory paths.
     */
    getWorkspacePaths() {
        const folders = vscode_1.workspace.workspaceFolders || [];
        const paths = [];
        folders.forEach((folder) => {
            if (fs_1.existsSync(folder.uri.fsPath)) {
                paths.push(folder.uri.fsPath);
            }
        });
        return paths;
    }
}
exports.default = Git;
//# sourceMappingURL=Git.js.map