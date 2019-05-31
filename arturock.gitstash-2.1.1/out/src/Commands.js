'use string';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const vscode = require("vscode");
const StashGit_1 = require("./StashGit");
const StashCommands_1 = require("./StashCommands");
const StashNode_1 = require("./StashNode");
const StashNodeFactory_1 = require("./StashNodeFactory");
class Commands {
    constructor(stashCommands, diffDisplayer, stashLabels) {
        /**
         * Shows a stashed file diff document.
         *
         * @param fileNode the involved node
         */
        this.show = (fileNode) => {
            this.displayer.display(fileNode);
        };
        /**
         * Shows a stashed file diff document compared with the HEAD version.
         *
         * @param fileNode the involved node
         */
        this.diffCurrent = (fileNode) => {
            this.displayer.diffCurrent(fileNode);
        };
        /**
         * Generate a stash on the active repository or selects a repository and continues.
         *
         * @param repositoryNode the involved node
         */
        this.stash = (repositoryNode) => {
            this.runOnRepository(repositoryNode, (repositoryNode) => { this.stashPerform(repositoryNode); });
        };
        /**
         * Clears all the stashes active repository or selects a repository and continues.
         *
         * @param repositoryNode the involved node
         */
        this.clear = (repositoryNode) => {
            this.runOnRepository(repositoryNode, (repositoryNode) => { this.clearPerform(repositoryNode); });
        };
        /**
         * Pops the selected stash or selects one and continue.
         *
         * @param stashNode the involved node
         */
        this.pop = (stashNode) => {
            this.runOnStash(stashNode, { placeHolder: 'Pick a stash to pop' }, (stashNode) => { this.popPerform(stashNode); });
        };
        /**
         * Applies the selected stash or selects one and continue.
         *
         * @param stashNode the involved node
         */
        this.apply = (stashNode) => {
            this.runOnStash(stashNode, { placeHolder: 'Pick a stash to apply' }, (stashNode) => { this.applyPerform(stashNode); });
        };
        /**
         * Branches the selected stash or selects one and continue.
         *
         * @param stashNode the involved node
         */
        this.branch = (stashNode) => {
            this.runOnStash(stashNode, { placeHolder: 'Pick a stash to branch' }, (stashNode) => { this.branchPerform(stashNode); });
        };
        /**
         * Drops the currently selected stash or selects one and continue.
         *
         * @param stashNode the involved node
         */
        this.drop = (stashNode) => {
            this.runOnStash(stashNode, { placeHolder: 'Pick a stash to drop' }, (stashNode) => { this.dropPerform(stashNode); });
        };
        /**
         * Generates a stash for the given repository.
         *
         * @param repositoryNode the repository node
         */
        this.stashPerform = (repositoryNode) => {
            this.stashGit.isStashable(repositoryNode.path).then((isStashable) => {
                if (!isStashable) {
                    return vscode.window.showInformationMessage('There are no changes to stash.');
                }
                const repositoryLabel = this.stashLabels.getName(repositoryNode);
                vscode.window
                    .showQuickPick([
                    {
                        label: 'Stash only',
                        description: 'Crate a simple stash',
                        type: StashCommands_1.StashCommands.StashType.Simple
                    },
                    {
                        label: 'Keep index',
                        description: 'Stash but keep all changes added to the index intact',
                        type: StashCommands_1.StashCommands.StashType.KeepIndex
                    },
                    {
                        label: 'Include untracked',
                        description: 'Stash also untracked files',
                        type: StashCommands_1.StashCommands.StashType.IncludeUntracked
                    },
                    {
                        label: 'Include untracked + keep index',
                        description: '',
                        type: StashCommands_1.StashCommands.StashType.IncludeUntrackedKeepIndex
                    },
                    {
                        label: 'All',
                        description: 'Stash also untracked and ignored files',
                        type: StashCommands_1.StashCommands.StashType.All
                    },
                    {
                        label: 'All + keep index',
                        description: '',
                        type: StashCommands_1.StashCommands.StashType.AllKeepIndex
                    }
                ], { placeHolder: `${repositoryLabel}  Select actions` })
                    .then((option) => {
                    if (typeof option !== 'undefined') {
                        vscode.window
                            .showInputBox({
                            placeHolder: `${repositoryLabel}  Stash message`,
                            prompt: 'Optionally provide a stash message'
                        })
                            .then((stashMessage) => {
                            if (typeof stashMessage === 'string') {
                                this.stashCommands.stash(repositoryNode, option.type, stashMessage);
                            }
                        });
                    }
                });
            });
        };
        /**
         * Removes the stashes on the given repository.
         *
         * @param repositoryNode the involved node
         */
        this.clearPerform = (repositoryNode) => {
            const repositoryLabel = this.stashLabels.getName(repositoryNode);
            vscode.window
                .showWarningMessage(`Clear stashes on ${repositoryLabel}?`, { modal: true }, { title: 'Proceed' })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.clear(repositoryNode);
                }
            }, (e) => console.error('failure', e));
        };
        /**
         * Confirms and pops.
         *
         * @param stashNode the involved node
         */
        this.popPerform = (stashNode) => {
            vscode.window.showQuickPick([
                {
                    label: 'Pop only',
                    description: 'Perform a simple pop',
                    withIndex: false
                },
                {
                    label: 'Pop and reindex',
                    description: 'Pop and reinstate the files added to index',
                    withIndex: true
                }
            ], { placeHolder: `${this.stashLabels.getName(stashNode)}  Select action` })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.pop(stashNode, option.withIndex);
                }
            });
        };
        /**
         * Confirms and applies.
         *
         * @param stashNode the involved node
         */
        this.applyPerform = (stashNode) => {
            vscode.window.showQuickPick([
                {
                    label: 'Apply only',
                    description: 'Perform a simple apply',
                    withIndex: false
                },
                {
                    label: 'Apply and reindex',
                    description: 'Apply and reinstate the files added to index',
                    withIndex: true
                }
            ], { placeHolder: `${this.stashLabels.getName(stashNode)}  Select action` })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.apply(stashNode, option.withIndex);
                }
            });
        };
        /**
         * Branches a stash.
         *
         * @param stashNode the involved node
         */
        this.branchPerform = (stashNode) => {
            vscode.window
                .showInputBox({ placeHolder: 'Branch name' })
                .then((branchName) => {
                if (typeof branchName === 'string' && branchName.length > 0) {
                    this.stashCommands.branch(stashNode, branchName);
                }
            });
        };
        /**
         * Confirms and drops.
         *
         * @param stashNode the involved node
         */
        this.dropPerform = (stashNode) => {
            const repositoryLabel = this.stashLabels.getName(stashNode.parent);
            const stashLabel = this.stashLabels.getName(stashNode);
            vscode.window
                .showWarningMessage(`${repositoryLabel}\n\nDrop ${stashLabel}?`, { modal: true }, { title: 'Proceed' })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.drop(stashNode);
                }
            });
        };
        /**
         * Shows a selector to perform an apply / pop action.
         *
         * @param stashNode the involved node
         */
        this.applyOrPop = (stashNode) => {
            const repositoryNode = this.stashNodeFactory.createRepositoryNode(stashNode.parent.path);
            vscode.window
                .showQuickPick([
                {
                    label: 'Pop',
                    description: 'Pop the selected stash',
                    action: 'pop'
                },
                {
                    label: 'Apply',
                    description: 'Apply the selected stash',
                    action: 'apply'
                }
            ], { placeHolder: `${this.stashLabels.getName(repositoryNode)}  ${this.stashLabels.getName(stashNode)}` })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    if (option.action === 'pop') {
                        this.popPerform(stashNode);
                    }
                    else if (option.action === 'apply') {
                        this.applyPerform(stashNode);
                    }
                }
            });
        };
        /**
         * Applies the changes on the stashed file.
         *
         * @param fileNode the involved node
         */
        this.applySingle = (fileNode) => {
            const parentLabel = this.stashLabels.getName(fileNode.parent);
            vscode.window
                .showWarningMessage(`${parentLabel}\n\nApply changes on ${fileNode.name}?`, { modal: true }, { title: 'Proceed' })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.applySingle(fileNode);
                }
            });
        };
        /**
         * Applies the changes on the stashed file.
         *
         * @param fileNode the involved node
         */
        this.createSingle = (fileNode) => {
            const parentLabel = this.stashLabels.getName(fileNode.parent);
            const exists = fs.existsSync(fileNode.path);
            vscode.window
                .showWarningMessage(`${parentLabel}\n\nCreate file ${fileNode.name}?${exists ? '\n\nThis will overwrite the current file' : ''}`, { modal: true }, { title: 'Proceed' })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.createSingle(fileNode);
                }
            });
        };
        /**
         * Executes a callback on a repository.
         *
         * @param repositoryOrStashNode the involved node
         * @param placeHolder           the placeholder for the picker
         * @param callback              the callback to execute with the node
         */
        this.runOnRepository = (repositoryOrStashNode, callback) => {
            if (repositoryOrStashNode) {
                callback(repositoryOrStashNode);
            }
            else {
                this.executeOnRepository((repositoryNode) => {
                    callback(repositoryNode);
                });
            }
        };
        /**
         * Executes a callback on a stash.
         *
         * @param repositoryOrStashNode the involved node
         * @param options               the picker options
         * @param callback              the callback to execute with the node
         */
        this.runOnStash = (repositoryOrStashNode, options, callback) => {
            if (repositoryOrStashNode && repositoryOrStashNode.type === StashNode_1.NodeType.Stash) {
                callback(repositoryOrStashNode);
            }
            else if (repositoryOrStashNode && repositoryOrStashNode.type === StashNode_1.NodeType.Repository) {
                this.showStashes(repositoryOrStashNode.path, options, callback);
            }
            else {
                this.runOnRepository(repositoryOrStashNode, (repositoryNode) => {
                    this.showStashes(repositoryNode.path, options, callback);
                });
            }
        };
        this.stashCommands = stashCommands;
        this.stashLabels = stashLabels;
        this.displayer = diffDisplayer;
        this.stashGit = new StashGit_1.default();
        this.stashNodeFactory = new StashNodeFactory_1.default();
    }
    /**
     * Executes a callback on the current active repository or show a pick selector to choose a repository.
     *
     * @param callback the callback to execute
     */
    executeOnRepository(callback) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.showRepositories(callback);
            return;
        }
        const editorPath = editor.document.uri.path;
        this.stashGit.getRepositories().then((repositories) => {
            let cwd = null;
            repositories.forEach((repository) => {
                if (editorPath.indexOf(repository) !== -1) {
                    cwd = repository;
                    return false;
                }
            });
            if (!cwd) {
                this.showRepositories(callback);
                return;
            }
            callback(this.stashNodeFactory.createRepositoryNode(cwd));
        });
    }
    /**
     * Show a quick pick with the repositories list and executes a callback on it.
     *
     * @param callback the callback to execute
     */
    showRepositories(callback) {
        const options = {
            placeHolder: 'Select a repository',
            canPickMany: false
        };
        this.stashGit.getRepositories().then((repositories) => {
            if (repositories.length === 0) {
                vscode.window.showInformationMessage('There are no git repositories.');
            }
            else if (repositories.length === 1) {
                callback(this.stashNodeFactory.createRepositoryNode(repositories[0]));
            }
            else {
                vscode.window
                    .showQuickPick(this.makeRepositoriesList(repositories), options)
                    .then((selection) => {
                    if (typeof selection !== 'undefined') {
                        callback(selection.node);
                    }
                });
            }
        });
    }
    /**
     * Gets the stashes list for the given current working directory.
     *
     * @param cwd      the current working directory
     * @param options  the object containing the quick pick options
     * @param callback the callback to execute
     */
    showStashes(cwd, options, callback) {
        const repositoryNode = this.stashNodeFactory.createRepositoryNode(cwd);
        const repositoryLabel = this.stashLabels.getName(repositoryNode);
        options.placeHolder = `${repositoryLabel}  ${options.placeHolder}`;
        this.stashGit.getStashes(cwd).then((list) => {
            if (list.length > 0) {
                vscode.window
                    .showQuickPick(this.makeStashOptionsList(repositoryNode, list), options)
                    .then((selection) => {
                    if (typeof selection !== 'undefined') {
                        let nodeOrNodes = null;
                        if (Array.isArray(selection)) {
                            nodeOrNodes = [];
                            selection.forEach((value) => nodeOrNodes.push(value.node));
                        }
                        else {
                            nodeOrNodes = selection.node;
                        }
                        callback(nodeOrNodes);
                    }
                });
            }
            else {
                vscode.window.showInformationMessage(`There are no stashed changes on ${repositoryLabel}.`);
            }
        });
    }
    /**
     * Generates a an options list with the existent repositories.
     *
     * @param repositories an array of repository paths
     */
    makeRepositoriesList(repositories) {
        const options = [];
        for (const repositoryPath of repositories) {
            const node = this.stashNodeFactory.createRepositoryNode(repositoryPath);
            const option = {
                label: this.stashLabels.getName(node),
                node: node
            };
            options.push(option);
        }
        return options;
    }
    /**
     * Generates an options list with the stashes.
     *
     * @param repositoryNode the repository node to use as base
     * @param stashes        an array of Stash objects
     */
    makeStashOptionsList(repositoryNode, stashList) {
        const options = [];
        for (const stash of stashList) {
            const node = this.stashNodeFactory.createStashNode(stash, repositoryNode);
            options.push({
                label: this.stashLabels.getName(node),
                node: node
            });
        }
        return options;
    }
}
exports.Commands = Commands;
//# sourceMappingURL=Commands.js.map