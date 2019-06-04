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
const cp = require("child_process");
const config_1 = require("./config");
const utils_1 = require("./utils");
const eolRegex = /\r\n|\r|\n/g;
const headRegex = /^\(HEAD detached at [0-9A-Za-z]+\)/g;
const gitLogSeparator = 'XX7Nal-YARtTpjCikii9nJxER19D6diSyk-AWkPb';
class DataSource {
    constructor() {
        this.registerGitPath();
        this.generateGitCommandFormats();
    }
    registerGitPath() {
        this.gitPath = config_1.getConfig().gitPath();
        this.gitExecPath = this.gitPath.indexOf(' ') > -1 ? '"' + this.gitPath + '"' : this.gitPath;
    }
    generateGitCommandFormats() {
        let dateType = config_1.getConfig().dateType() === 'Author Date' ? '%at' : '%ct';
        this.gitLogFormat = ['%H', '%P', '%an', '%ae', dateType, '%s'].join(gitLogSeparator);
        this.gitCommitDetailsFormat = ['%H', '%P', '%an', '%ae', dateType, '%cn'].join(gitLogSeparator) + '%n%B';
    }
    getBranches(repo, showRemoteBranches) {
        return new Promise((resolve) => {
            this.execGit('branch' + (showRemoteBranches ? ' -a' : ''), repo, (err, stdout) => {
                let branchData = {
                    branches: [],
                    head: null,
                    error: false
                };
                if (err) {
                    branchData.error = true;
                }
                else {
                    let lines = stdout.split(eolRegex);
                    for (let i = 0; i < lines.length - 1; i++) {
                        let name = lines[i].substring(2).split(' -> ')[0];
                        if (name.match(headRegex) !== null)
                            continue;
                        if (lines[i][0] === '*') {
                            branchData.head = name;
                            branchData.branches.unshift(name);
                        }
                        else {
                            branchData.branches.push(name);
                        }
                    }
                }
                resolve(branchData);
            });
        });
    }
    getCommits(repo, branches, maxCommits, showRemoteBranches) {
        return new Promise(resolve => {
            Promise.all([
                this.getGitLog(repo, branches, maxCommits + 1, showRemoteBranches),
                this.getRefs(repo, showRemoteBranches),
                this.getRemotes(repo)
            ]).then((results) => __awaiter(this, void 0, void 0, function* () {
                let commits = results[0], refData = results[1], i, unsavedChanges = null;
                let moreCommitsAvailable = commits.length === maxCommits + 1;
                if (moreCommitsAvailable)
                    commits.pop();
                if (refData.head !== null) {
                    for (i = 0; i < commits.length; i++) {
                        if (refData.head === commits[i].hash) {
                            unsavedChanges = config_1.getConfig().showUncommittedChanges() ? yield this.getGitUnsavedChanges(repo) : null;
                            if (unsavedChanges !== null) {
                                commits.unshift({ hash: utils_1.UNCOMMITTED, parentHashes: [refData.head], author: '*', email: '', date: Math.round((new Date()).getTime() / 1000), message: 'Uncommitted Changes (' + unsavedChanges.changes + ')' });
                            }
                            break;
                        }
                    }
                }
                let commitNodes = [];
                let commitLookup = {};
                for (i = 0; i < commits.length; i++) {
                    commitLookup[commits[i].hash] = i;
                    commitNodes.push({ hash: commits[i].hash, parentHashes: commits[i].parentHashes, author: commits[i].author, email: commits[i].email, date: commits[i].date, message: commits[i].message, heads: [], tags: [], remotes: [] });
                }
                for (i = 0; i < refData.heads.length; i++) {
                    if (typeof commitLookup[refData.heads[i].hash] === 'number')
                        commitNodes[commitLookup[refData.heads[i].hash]].heads.push(refData.heads[i].name);
                }
                for (i = 0; i < refData.tags.length; i++) {
                    if (typeof commitLookup[refData.tags[i].hash] === 'number')
                        commitNodes[commitLookup[refData.tags[i].hash]].tags.push(refData.tags[i].name);
                }
                for (i = 0; i < refData.remotes.length; i++) {
                    if (typeof commitLookup[refData.remotes[i].hash] === 'number') {
                        let name = refData.remotes[i].name;
                        let remote = results[2].find(remote => name.startsWith(remote + '/'));
                        if (typeof remote === 'string')
                            commitNodes[commitLookup[refData.remotes[i].hash]].remotes.push({ name: name, remote: remote });
                    }
                }
                resolve({ commits: commitNodes, head: refData.head, remotes: results[2], moreCommitsAvailable: moreCommitsAvailable });
            }));
        });
    }
    commitDetails(repo, commitHash) {
        return new Promise(resolve => {
            Promise.all([
                new Promise((resolve, reject) => this.execGit('show --quiet ' + commitHash + ' --format="' + this.gitCommitDetailsFormat + '"', repo, (err, stdout) => {
                    if (err) {
                        reject();
                    }
                    else {
                        let lines = stdout.split(eolRegex);
                        let lastLine = lines.length - 1;
                        while (lines.length > 0 && lines[lastLine] === '')
                            lastLine--;
                        let commitInfo = lines[0].split(gitLogSeparator);
                        resolve({
                            hash: commitInfo[0],
                            parents: commitInfo[1].split(' '),
                            author: commitInfo[2],
                            email: commitInfo[3],
                            date: parseInt(commitInfo[4]),
                            committer: commitInfo[5],
                            body: lines.slice(1, lastLine + 1).join('\n'),
                            fileChanges: []
                        });
                    }
                })),
                this.getDiffTreeNameStatus(repo, commitHash, commitHash),
                this.getDiffTreeNumStat(repo, commitHash, commitHash)
            ]).then(results => {
                results[0].fileChanges = generateFileChanges(results[1], results[2], []);
                resolve(results[0]);
            }).catch(() => resolve(null));
        });
    }
    uncommittedDetails(repo) {
        return new Promise(resolve => {
            Promise.all([
                this.getDiffTreeNameStatus(repo, 'HEAD', ''),
                this.getDiffTreeNumStat(repo, 'HEAD', ''),
                this.getUntrackedFiles(repo)
            ]).then(results => {
                resolve({
                    hash: utils_1.UNCOMMITTED, parents: [], author: '', email: '', date: 0, committer: '', body: '',
                    fileChanges: generateFileChanges(results[0], results[1], results[2])
                });
            }).catch(() => resolve(null));
        });
    }
    compareCommits(repo, fromHash, toHash) {
        return new Promise(resolve => {
            let promises = [
                this.getDiffTreeNameStatus(repo, fromHash, toHash === utils_1.UNCOMMITTED ? '' : toHash),
                this.getDiffTreeNumStat(repo, fromHash, toHash === utils_1.UNCOMMITTED ? '' : toHash)
            ];
            if (toHash === utils_1.UNCOMMITTED)
                promises.push(this.getUntrackedFiles(repo));
            Promise.all(promises)
                .then(results => resolve(generateFileChanges(results[0], results[1], toHash === utils_1.UNCOMMITTED ? results[2] : [])))
                .catch(() => resolve(null));
        });
    }
    getCommitFile(repo, commitHash, filePath, type) {
        return commitHash === utils_1.UNCOMMITTED && type === 'D'
            ? new Promise(resolve => resolve(''))
            : this.spawnGit(['show', commitHash + ':' + filePath], repo, stdout => stdout, '');
    }
    getRemoteUrl(repo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                this.execGit('config --get remote.origin.url', repo, (err, stdout) => {
                    resolve(!err ? stdout.split(eolRegex)[0] : null);
                });
            });
        });
    }
    isGitRepository(path) {
        return new Promise(resolve => {
            this.execGit('rev-parse --git-dir', path, (err) => {
                resolve(!err);
            });
        });
    }
    addTag(repo, tagName, commitHash, lightweight, message) {
        let args = ['tag'];
        if (lightweight) {
            args.push(tagName);
        }
        else {
            args.push('-a', tagName, '-m', message);
        }
        args.push(commitHash);
        return this.runGitCommandSpawn(args, repo);
    }
    deleteTag(repo, tagName) {
        return this.runGitCommand('tag -d ' + escapeRefName(tagName), repo);
    }
    fetch(repo) {
        return this.runGitCommand('fetch --all', repo);
    }
    pushTag(repo, tagName) {
        return this.runGitCommand('push origin ' + escapeRefName(tagName), repo);
    }
    createBranch(repo, branchName, commitHash) {
        return this.runGitCommand('branch ' + escapeRefName(branchName) + ' ' + commitHash, repo);
    }
    checkoutBranch(repo, branchName, remoteBranch) {
        return this.runGitCommand('checkout ' + (remoteBranch === null ? escapeRefName(branchName) : ' -b ' + escapeRefName(branchName) + ' ' + escapeRefName(remoteBranch)), repo);
    }
    checkoutCommit(repo, commitHash) {
        return this.runGitCommand('checkout ' + commitHash, repo);
    }
    deleteBranch(repo, branchName, forceDelete) {
        return this.runGitCommand('branch --delete' + (forceDelete ? ' --force' : '') + ' ' + escapeRefName(branchName), repo);
    }
    deleteRemoteBranch(repo, branchName, remote) {
        return this.runGitCommand('push ' + escapeRefName(remote) + ' --delete ' + escapeRefName(branchName), repo);
    }
    renameBranch(repo, oldName, newName) {
        return this.runGitCommand('branch -m ' + escapeRefName(oldName) + ' ' + escapeRefName(newName), repo);
    }
    mergeBranch(repo, branchName, createNewCommit, squash) {
        return __awaiter(this, void 0, void 0, function* () {
            let mergeStatus = yield this.runGitCommand('merge ' + escapeRefName(branchName) + (createNewCommit && !squash ? ' --no-ff' : '') + (squash ? ' --squash' : ''), repo);
            if (mergeStatus === null && squash) {
                if (yield this.areStagedChanges(repo)) {
                    return this.runGitCommand('commit -m "Merge branch \'' + escapeRefName(branchName) + '\'"', repo);
                }
            }
            return mergeStatus;
        });
    }
    mergeCommit(repo, commitHash, createNewCommit, squash) {
        return __awaiter(this, void 0, void 0, function* () {
            let mergeStatus = yield this.runGitCommand('merge ' + commitHash + (createNewCommit && !squash ? ' --no-ff' : '') + (squash ? ' --squash' : ''), repo);
            if (mergeStatus === null && squash) {
                if (yield this.areStagedChanges(repo)) {
                    return this.runGitCommand('commit -m "Merge commit \'' + commitHash + '\'"', repo);
                }
            }
            return mergeStatus;
        });
    }
    rebaseOn(repo, base, type, ignoreDate, interactive) {
        let escapedBase = type === 'Branch' ? escapeRefName(base) : base;
        if (interactive) {
            utils_1.runCommandInNewTerminal(repo, this.gitExecPath + ' rebase --interactive ' + escapedBase, 'Git Rebase on "' + (type === 'Branch' ? base : utils_1.abbrevCommit(base)) + '"');
            return new Promise(resolve => setTimeout(() => resolve(null), 1000));
        }
        else {
            return this.runGitCommand('rebase ' + escapedBase + (ignoreDate ? ' --ignore-date' : ''), repo);
        }
    }
    cherrypickCommit(repo, commitHash, parentIndex) {
        return this.runGitCommand('cherry-pick ' + commitHash + (parentIndex > 0 ? ' -m ' + parentIndex : ''), repo);
    }
    cleanUntrackedFiles(repo, directories) {
        return this.runGitCommand('clean -f' + (directories ? 'd' : ''), repo);
    }
    revertCommit(repo, commitHash, parentIndex) {
        return this.runGitCommand('revert --no-edit ' + commitHash + (parentIndex > 0 ? ' -m ' + parentIndex : ''), repo);
    }
    resetToCommit(repo, commitHash, resetMode) {
        return this.runGitCommand('reset --' + resetMode + ' ' + commitHash, repo);
    }
    getRefs(repo, showRemoteBranches) {
        let args = ['show-ref'];
        if (!showRemoteBranches)
            args.push('--heads', '--tags');
        args.push('-d', '--head');
        let refData = { head: null, heads: [], tags: [], remotes: [] };
        return this.spawnGit(args, repo, stdout => {
            let lines = stdout.split(eolRegex);
            for (let i = 0; i < lines.length - 1; i++) {
                let line = lines[i].split(' ');
                if (line.length < 2)
                    continue;
                let hash = line.shift();
                let ref = line.join(' ');
                if (ref.startsWith('refs/heads/')) {
                    refData.heads.push({ hash: hash, name: ref.substring(11) });
                }
                else if (ref.startsWith('refs/tags/')) {
                    refData.tags.push({ hash: hash, name: (ref.endsWith('^{}') ? ref.substring(10, ref.length - 3) : ref.substring(10)) });
                }
                else if (ref.startsWith('refs/remotes/')) {
                    refData.remotes.push({ hash: hash, name: ref.substring(13) });
                }
                else if (ref === 'HEAD') {
                    refData.head = hash;
                }
            }
            return refData;
        }, refData);
    }
    getRemotes(repo) {
        return new Promise(resolve => {
            this.execGit('remote', repo, (err, stdout) => {
                let lines = stdout.split(eolRegex);
                lines.pop();
                resolve(err ? [] : lines);
            });
        });
    }
    getGitLog(repo, branches, num, showRemoteBranches) {
        let args = ['log', '--max-count=' + num, '--format=' + this.gitLogFormat, '--date-order'];
        if (branches !== null) {
            for (let i = 0; i < branches.length; i++) {
                args.push(escapeRefName(branches[i]));
            }
        }
        else {
            args.push('--branches', '--tags');
            if (showRemoteBranches)
                args.push('--remotes');
        }
        return this.spawnGit(args, repo, (stdout) => {
            let lines = stdout.split(eolRegex);
            let gitCommits = [];
            for (let i = 0; i < lines.length - 1; i++) {
                let line = lines[i].split(gitLogSeparator);
                if (line.length !== 6)
                    break;
                gitCommits.push({ hash: line[0], parentHashes: line[1].split(' '), author: line[2], email: line[3], date: parseInt(line[4]), message: line[5] });
            }
            return gitCommits;
        }, []);
    }
    getGitUnsavedChanges(repo) {
        return new Promise((resolve) => {
            this.execGit('status -s --branch --untracked-files --porcelain', repo, (err, stdout) => {
                if (!err) {
                    let lines = stdout.split(eolRegex);
                    resolve(lines.length > 2 ? { branch: lines[0].substring(3).split('...')[0], changes: lines.length - 2 } : null);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    getUntrackedFiles(repo) {
        return new Promise(resolve => {
            this.execGit('-c core.quotepath=false status -s --untracked-files --porcelain', repo, (err, stdout) => {
                let files = [];
                if (!err) {
                    let lines = stdout.split(eolRegex);
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].startsWith('??'))
                            files.push(lines[i].substr(3));
                    }
                }
                resolve(files);
            });
        });
    }
    getDiffTreeNameStatus(repo, fromHash, toHash) {
        let cmd = fromHash === toHash
            ? 'diff-tree --name-status -r -m --root --find-renames --diff-filter=AMDR ' + fromHash
            : 'diff --name-status -m --find-renames --diff-filter=AMDR ' + fromHash + (toHash !== '' ? ' ' + toHash : '');
        return this.execDiffTree(repo, cmd, fromHash, toHash);
    }
    getDiffTreeNumStat(repo, fromHash, toHash) {
        let cmd = fromHash === toHash
            ? 'diff-tree --numstat -r -m --root --find-renames --diff-filter=AMDR ' + fromHash
            : 'diff --numstat -m --find-renames --diff-filter=AMDR ' + fromHash + (toHash !== '' ? ' ' + toHash : '');
        return this.execDiffTree(repo, cmd, fromHash, toHash);
    }
    execDiffTree(repo, cmd, fromHash, toHash) {
        return new Promise((resolve, reject) => this.execGit('-c core.quotepath=false ' + cmd, repo, (err, stdout) => {
            if (err) {
                reject();
            }
            else {
                let lines = stdout.split(eolRegex);
                if (fromHash === toHash)
                    lines.shift();
                resolve(lines);
            }
        }));
    }
    areStagedChanges(repo) {
        return new Promise(resolve => {
            this.execGit('diff-index HEAD', repo, (err, stdout) => resolve(!err && stdout !== ''));
        });
    }
    runGitCommand(command, repo) {
        return new Promise((resolve) => {
            this.execGit(command, repo, (err, stdout, stderr) => {
                if (!err) {
                    resolve(null);
                }
                else {
                    let lines;
                    if (stdout !== '' || stderr !== '') {
                        lines = (stderr !== '' ? stderr : stdout !== '' ? stdout : '').split(eolRegex);
                    }
                    else {
                        lines = err.message.split(eolRegex);
                        lines.shift();
                    }
                    resolve(lines.slice(0, lines.length - 1).join('\n'));
                }
            });
        });
    }
    runGitCommandSpawn(args, repo) {
        return new Promise((resolve) => {
            let stdout = '', stderr = '', err = false;
            const cmd = cp.spawn(this.gitPath, args, { cwd: repo });
            cmd.stdout.on('data', d => { stdout += d; });
            cmd.stderr.on('data', d => { stderr += d; });
            cmd.on('error', e => {
                resolve(e.message.split(eolRegex).join('\n'));
                err = true;
            });
            cmd.on('exit', (code) => {
                if (err)
                    return;
                if (code === 0) {
                    resolve(null);
                }
                else {
                    let lines = (stderr !== '' ? stderr : stdout !== '' ? stdout : '').split(eolRegex);
                    resolve(lines.slice(0, lines.length - 1).join('\n'));
                }
            });
        });
    }
    execGit(command, repo, callback) {
        cp.exec(this.gitExecPath + ' ' + command, { cwd: repo }, callback);
    }
    spawnGit(args, repo, successValue, errorValue) {
        return new Promise((resolve) => {
            let stdout = '', err = false;
            const cmd = cp.spawn(this.gitPath, args, { cwd: repo });
            cmd.stdout.on('data', (d) => { stdout += d; });
            cmd.on('error', () => {
                resolve(errorValue);
                err = true;
            });
            cmd.on('exit', (code) => {
                if (err)
                    return;
                resolve(code === 0 ? successValue(stdout) : errorValue);
            });
        });
    }
}
exports.DataSource = DataSource;
function escapeRefName(str) {
    return str.replace(/'/g, '\'');
}
function generateFileChanges(nameStatusResults, numStatResults, unstagedFiles) {
    let fileChanges = [], fileLookup = {}, i = 0;
    for (i = 0; i < nameStatusResults.length - 1; i++) {
        let line = nameStatusResults[i].split('\t');
        if (line.length < 2)
            continue;
        let oldFilePath = utils_1.getPathFromStr(line[1]), newFilePath = utils_1.getPathFromStr(line[line.length - 1]);
        fileLookup[newFilePath] = fileChanges.length;
        fileChanges.push({ oldFilePath: oldFilePath, newFilePath: newFilePath, type: line[0][0], additions: null, deletions: null });
    }
    for (i = 0; i < unstagedFiles.length; i++) {
        fileChanges.push({ oldFilePath: unstagedFiles[i], newFilePath: unstagedFiles[i], type: 'U', additions: null, deletions: null });
    }
    for (i = 0; i < numStatResults.length - 1; i++) {
        let line = numStatResults[i].split('\t');
        if (line.length !== 3)
            continue;
        let fileName = line[2].replace(/(.*){.* => (.*)}/, '$1$2').replace(/.* => (.*)/, '$1');
        if (typeof fileLookup[fileName] === 'number') {
            fileChanges[fileLookup[fileName]].additions = parseInt(line[0]);
            fileChanges[fileLookup[fileName]].deletions = parseInt(line[1]);
        }
    }
    return fileChanges;
}
//# sourceMappingURL=dataSource.js.map