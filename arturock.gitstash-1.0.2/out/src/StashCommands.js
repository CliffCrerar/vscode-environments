'use string';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const StashGit_1 = require("./StashGit");
var StashType;
(function (StashType) {
    StashType[StashType["Simple"] = 0] = "Simple";
    StashType[StashType["KeepIndex"] = 1] = "KeepIndex";
    StashType[StashType["IncludeUntracked"] = 2] = "IncludeUntracked";
    StashType[StashType["IncludeUntrackedKeepIndex"] = 3] = "IncludeUntrackedKeepIndex";
    StashType[StashType["All"] = 4] = "All";
    StashType[StashType["AllKeepIndex"] = 5] = "AllKeepIndex";
})(StashType || (StashType = {}));
class StashCommands {
    constructor(config, channel, stashLabels) {
        /**
         * Generates a stash.
         */
        this.stash = (type, message) => {
            const params = ['stash', 'save'];
            switch (type) {
                case StashType.KeepIndex:
                    params.push('--keep-index');
                    break;
                case StashType.IncludeUntracked:
                    params.push('--include-untracked');
                    break;
                case StashType.IncludeUntrackedKeepIndex:
                    params.push('--include-untracked');
                    params.push('--keep-index');
                    break;
                case StashType.All:
                    params.push('--all');
                    break;
                case StashType.AllKeepIndex:
                    params.push('--all');
                    params.push('--keep-index');
                    break;
            }
            if (message.length > 0) {
                params.push(message);
            }
            this.exec(params, 'Stash created');
        };
        /**
         * Pops a stash entry.
         */
        this.pop = (node, withIndex) => {
            const params = ['stash', 'pop'];
            if (withIndex) {
                params.push('--index');
            }
            params.push(`stash@{${node.index}}`);
            this.exec(params, 'Stash popped', node);
        };
        /**
         * Applies a stash entry.
         */
        this.apply = (node, withIndex) => {
            const params = ['stash', 'apply'];
            if (withIndex) {
                params.push('--index');
            }
            params.push(`stash@{${node.index}}`);
            this.exec(params, 'Stash applied', node);
        };
        /**
         * Applies a stash entry.
         */
        this.applySingle = (node) => {
            const params = [
                'checkout',
                `stash@{${node.parent.index}}`,
                node.name
            ];
            this.exec(params, 'Changes from file applied', node.parent);
        };
        /**
         * Branches a stash entry.
         */
        this.branch = (node, name) => {
            const params = [
                'stash',
                'branch',
                name,
                `stash@{${node.index}}`
            ];
            this.exec(params, 'Stash branched', node);
        };
        /**
         * Drops a stash entry.
         */
        this.drop = (node) => {
            const params = [
                'stash',
                'drop',
                `stash@{${node.index}}`
            ];
            this.exec(params, 'Stash dropped', node);
        };
        /**
         * Removes the stash entry list.
         */
        this.clear = () => {
            const params = ['stash', 'clear'];
            this.exec(params, 'Stash list cleared');
        };
        this.config = config;
        this.channel = channel;
        this.stashLabels = stashLabels;
        this.stashGit = new StashGit_1.default();
    }
    /**
     * Executes the git command.
     *
     * @param params         the array of command parameters
     * @param successMessage the string message to show on success
     * @param node           the involved node
     */
    exec(params, successMessage, node) {
        this.stashGit.exec(params)
            .then((result) => {
            let hasConflict = false;
            for (const line of result.split('\n')) {
                if (line.startsWith('CONFLICT (content): ')) {
                    hasConflict = true;
                    break;
                }
            }
            if (!hasConflict) {
                this.showDetails(params, 'success', result, successMessage, node);
            }
            else {
                this.showDetails(params, 'warning', result, `${successMessage} with conflicts`, node);
            }
        }, (error) => {
            const excerpt = error.substring(error.indexOf(':') + 1).trim();
            this.showDetails(params, 'error', error, excerpt, node);
        })
            .catch((error) => {
            this.showDetails(params, 'error', error.toString());
        });
    }
    /**
     * Shows the result message to the user.
     *
     * @param params      the git command params
     * @param type        the string message type
     * @param message     the string result message
     * @param description the optional string alert description
     */
    showDetails(params, type, message, description, node) {
        message = message.trim();
        console.log(params.join(' '));
        if (this.config.settings.log.autoclear) {
            this.channel.clear();
        }
        const currentTime = new Date();
        this.channel.append(`> ${currentTime}`);
        if (node) {
            this.channel.append(`: ${this.stashLabels.getEntryName(node)}`);
        }
        this.channel.appendLine('');
        this.channel.appendLine(`  git ${params.join(' ')}`);
        if (message.length > 0) {
            this.channel.appendLine(message);
        }
        this.channel.appendLine('');
        const summary = (description || message).substr(0, 300);
        const actions = message.length > 0 ? [{ title: 'Show log' }] : [];
        const callback = (value) => {
            if (typeof value !== 'undefined') {
                this.channel.show(true);
            }
        };
        if (type === 'success') {
            vscode.window.showInformationMessage(summary, ...actions).then(callback);
        }
        else if (type === 'warning') {
            vscode.window.showWarningMessage(summary, ...actions).then(callback);
        }
        else {
            vscode.window.showErrorMessage(summary, ...actions).then(callback);
        }
    }
}
StashCommands.StashType = StashType;
exports.StashCommands = StashCommands;
//# sourceMappingURL=StashCommands.js.map