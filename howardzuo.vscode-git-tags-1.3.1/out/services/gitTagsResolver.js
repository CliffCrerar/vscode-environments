"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const vscode = require("vscode");
const gitpath = vscode.workspace.getConfiguration('git').get('path') || 'git';
function tags(cwd) {
    return new Promise((resolve, reject) => {
        child_process.exec(gitpath + ' log --tags --decorate --simplify-by-decoration --oneline', {
            cwd: cwd
        }, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            if (stderr) {
                return reject(stderr);
            }
            const tags = stdout
                .replace(/\r\n/mg, '\n')
                .split('\n')
                .filter(line => /[\(\s]tag:\s/.test(line))
                .map(line => {
                const matched = line.match(/([a-z0-9]{7})\s\((.*)\)\s(.*)/);
                return {
                    hash: matched[1],
                    tag: matched[2].match(/tag:\s([^,\s]+)/)[1],
                    commitMessage: matched[3]
                };
            });
            resolve(tags);
        });
    });
}
exports.tags = tags;
function create(val, cwd) {
    return createWithMessage(val, '', cwd);
}
exports.create = create;
function createWithMessage(val, message, cwd) {
    if (!val) {
        return Promise.reject('NO_VALUE');
    }
    return new Promise((resolve, reject) => {
        child_process.exec(`${gitpath} tag ${message ? '-m "' + message + '"' : ''} ${val}`, {
            cwd: cwd
        }, (error, stdout, stderr) => {
            if (stderr) {
                return reject(stderr);
            }
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });
}
exports.createWithMessage = createWithMessage;
function syncCreate(cwd) {
    return new Promise((resolve, reject) => {
        child_process.exec(gitpath + ' push --tags', {
            cwd: cwd
        }, (error, stdout, stderr) => {
            if (error) {
                return reject('SYNC_FAILED');
            }
            if (stderr && !/\[new tag\]/.test(stderr)) {
                return reject('SYNC_FAILED');
            }
            resolve('SYNCED');
        });
    });
}
exports.syncCreate = syncCreate;
function deleteTag(tag, cwd) {
    return new Promise((resolve, reject) => {
        child_process.exec(`${gitpath} tag -d ${tag}`, {
            cwd: cwd
        }, (error, stdout, stderr) => {
            if (stderr && !/Deleted tag/.test(stderr)) {
                return reject('DEL_FAILED');
            }
            if (error) {
                return reject('DEL_FAILED');
            }
            resolve('DELETED');
        });
    });
}
exports.deleteTag = deleteTag;
function syncDelete(tag, cwd) {
    return new Promise((resolve, reject) => {
        child_process.exec(`${gitpath} push origin :refs/tags/${tag}`, {
            cwd: cwd
        }, (error, stdout, stderr) => {
            if (error) {
                return reject('SYNC_FAILED');
            }
            if (stderr && !/\[deleted\]/.test(stderr)) {
                return reject('SYNC_FAILED');
            }
            resolve('SYNCED');
        });
    });
}
exports.syncDelete = syncDelete;
function refreshFromRemote(cwd) {
    child_process.exec(gitpath + ' fetch --tags', { cwd: cwd }, () => {
        console.log('tags refreshed with remote');
    });
}
exports.refreshFromRemote = refreshFromRemote;
//# sourceMappingURL=gitTagsResolver.js.map