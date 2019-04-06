'use string';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const StashGit_1 = require("./StashGit");
const StashCommands_1 = require("./StashCommands");
const StashNodeFactory_1 = require("./StashNodeFactory");
class Commands {
    constructor(stashCommands, diffDisplayer, stashLabels) {
        /**
         * Shows a stashed file diff document.
         *
         * @param node the involved node
         */
        this.show = (node) => {
            this.displayer.display(node);
        };
        /**
         * Shows a stashed file diff document compared with the HEAD version.
         *
         * @param node the involved node
         */
        this.diffCurrent = (node) => {
            this.displayer.diffCurrent(node);
        };
        /**
         * Applies the changes on the stashed file
         *
         * @param node the involved node
         */
        this.applySingle = (node) => {
            const label = this.stashLabels.getFileName(node);
            vscode.window
                .showWarningMessage(`Apply changes from ${label}?`, { modal: true }, { title: 'Proceed' })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.applySingle(node);
                }
            });
        };
        /**
         * Generates a stash.
         */
        this.stash = () => {
            this.stashGit.isStashable().then((isStashable) => {
                if (!isStashable) {
                    return vscode.window.showInformationMessage('There are no changes to stash.');
                }
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
                ])
                    .then((option) => {
                    if (typeof option !== 'undefined') {
                        vscode.window
                            .showInputBox({
                            placeHolder: 'Stash message',
                            prompt: 'Optionally provide a stash message'
                        })
                            .then((stashMessage) => {
                            if (typeof stashMessage === 'string') {
                                this.stashCommands.stash(option.type, stashMessage);
                            }
                        });
                    }
                });
            });
        };
        /**
         * Shows a selector to perform an apply / pop action.
         *
         * @param node the involved node
         */
        this.applyOrPop = (node) => {
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
            ], { placeHolder: this.stashLabels.getEntryName(node) })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    if (option.action === 'pop') {
                        this.pop(node);
                    }
                    else if (option.action === 'apply') {
                        this.apply(node);
                    }
                }
            });
        };
        /**
         * Pops the selected stash or selects one to pop.
         *
         * @param node the involved node
         */
        this.pop = (node) => {
            if (node) {
                this.popPerform(node);
                return;
            }
            this.showStashPick({ placeHolder: 'Pick a stash to pop' }, (node) => {
                this.popPerform(node);
            });
        };
        /**
         * Confirms and pops.
         *
         * @param node the involved node
         */
        this.popPerform = (node) => {
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
            ], { placeHolder: this.stashLabels.getEntryName(node) })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.pop(node, option.withIndex);
                }
            });
        };
        /**
         * Applies the selected stash or selects one to apply.
         *
         * @param node the involved node
         */
        this.apply = (node) => {
            if (node) {
                this.applyPerform(node);
                return;
            }
            this.showStashPick({ placeHolder: 'Pick a stash to apply' }, (node) => {
                this.applyPerform(node);
            });
        };
        /**
         * Confirms and applies.
         *
         * @param node the involved node
         */
        this.applyPerform = (node) => {
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
            ], { placeHolder: this.stashLabels.getEntryName(node) })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.apply(node, option.withIndex);
                }
            });
        };
        /**
         * Branches a stash entry.
         */
        this.branch = () => {
            this.showStashPick({ placeHolder: 'Pick a stash to branch' }, (node) => {
                vscode.window
                    .showInputBox({ placeHolder: 'Branch name' })
                    .then((branchName) => {
                    if (typeof branchName === 'string' && branchName.length > 0) {
                        this.stashCommands.branch(node, branchName);
                    }
                });
            });
        };
        /**
         * Drops the currently selected stash or selects a stash to drop.
         *
         * @param node the involved node
         */
        this.drop = (node) => {
            if (node) {
                this.dropPerform(node);
                return;
            }
            this.showStashPick({ placeHolder: 'Pick a stash to drop' }, (node) => {
                this.dropPerform(node);
            });
        };
        /**
         * Confirms and drops.
         *
         * @param node the involved node
         */
        this.dropPerform = (node) => {
            const label = this.stashLabels.getEntryName(node);
            vscode.window
                .showWarningMessage(`${label}\n${node.date}\n\nDrop this stash?`, { modal: true }, { title: 'Proceed' })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.drop(node);
                }
            });
        };
        /**
         * Removes the stash entry list.
         */
        this.clear = () => {
            vscode.window
                .showWarningMessage('This will remove all the stash entries. Are you sure?', { modal: true }, { title: 'Proceed' })
                .then((option) => {
                if (typeof option !== 'undefined') {
                    this.stashCommands.clear();
                }
            }, (e) => console.error('failure', e));
        };
        this.stashCommands = stashCommands;
        this.stashLabels = stashLabels;
        this.displayer = diffDisplayer;
        this.stashGit = new StashGit_1.default();
        this.stashNodeFactory = new StashNodeFactory_1.default();
    }
    /**
     * Show a quick pick with the branches list and executes a callback on it.
     *
     * @param options  the object containing the quick pick options
     * @param callback the callback to execute
     */
    showStashPick(options, callback) {
        options.canPickMany = false;
        this.stashGit.getStashList().then((list) => {
            if (list.length > 0) {
                vscode.window
                    .showQuickPick(this.makeStashOptionsList(list), options)
                    .then((selection) => {
                    if (typeof selection !== 'undefined') {
                        callback(selection.node);
                    }
                });
            }
            else {
                vscode.window.showInformationMessage('There are no stashed changes.');
            }
        });
    }
    /**
     * Generates a an options list with the stash entries.
     *
     * @param stashList an array of StashEntry objects
     */
    makeStashOptionsList(stashList) {
        const options = [];
        for (const stashEntry of stashList) {
            const node = this.stashNodeFactory.entryToNode(stashEntry);
            options.push({
                label: this.stashLabels.getEntryName(node),
                node: node
            });
        }
        return options;
    }
}
exports.Commands = Commands;
//# sourceMappingURL=Commands.js.map