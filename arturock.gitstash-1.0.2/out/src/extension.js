'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
require("./init");
const vscode_1 = require("vscode");
const Commands_1 = require("./Commands");
const Config_1 = require("./Config");
const StashLabels_1 = require("./StashLabels");
const GitStashTreeDataProvider_1 = require("./GitStashTreeDataProvider");
const EmptyDocumentContentProvider_1 = require("./EmptyDocumentContentProvider");
const Model_1 = require("./Model");
const StashCommands_1 = require("./StashCommands");
const DiffDisplayer_1 = require("./DiffDisplayer");
function activate(context) {
    const model = new Model_1.default();
    const config = new Config_1.default();
    const stashLabels = new StashLabels_1.default(config);
    const treeProvider = new GitStashTreeDataProvider_1.default(config, model, stashLabels);
    const emptyDocumentProvider = new EmptyDocumentContentProvider_1.EmptyDocumentContentProvider();
    const stashCommands = new Commands_1.Commands(new StashCommands_1.StashCommands(config, vscode_1.window.createOutputChannel('GitStash'), stashLabels), new DiffDisplayer_1.DiffDisplayer(model, stashLabels), stashLabels);
    const watcher = vscode_1.workspace.createFileSystemWatcher('**/refs/stash', false, false, false);
    context.subscriptions.push(vscode_1.window.registerTreeDataProvider('gitstash.explorer', treeProvider), vscode_1.workspace.registerTextDocumentContentProvider('empty-stash', emptyDocumentProvider), vscode_1.commands.registerCommand('gitstash.explorer.toggle', treeProvider.toggle), vscode_1.commands.registerCommand('gitstash.explorer.refresh', treeProvider.refresh), vscode_1.commands.registerCommand('gitstash.show', stashCommands.show), vscode_1.commands.registerCommand('gitstash.stash', stashCommands.stash), vscode_1.commands.registerCommand('gitstash.pop', stashCommands.pop), vscode_1.commands.registerCommand('gitstash.apply', stashCommands.apply), vscode_1.commands.registerCommand('gitstash.branch', stashCommands.branch), vscode_1.commands.registerCommand('gitstash.drop', stashCommands.drop), vscode_1.commands.registerCommand('gitstash.clear', stashCommands.clear), vscode_1.commands.registerCommand('gitstash.applyOrPop', stashCommands.applyOrPop), vscode_1.commands.registerCommand('gitstash.diffCurrent', stashCommands.diffCurrent), vscode_1.commands.registerCommand('gitstash.applySingle', stashCommands.applySingle), watcher.onDidCreate((event) => treeProvider.reload('create', event)), watcher.onDidChange((event) => treeProvider.reload('update', event)), watcher.onDidDelete((event) => treeProvider.reload('delete', event)), vscode_1.workspace.onDidChangeConfiguration(() => {
        config.reload();
        treeProvider.reload('settings');
    }));
    treeProvider.toggle();
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map