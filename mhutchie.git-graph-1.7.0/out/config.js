"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Config {
    constructor() {
        this.workspaceConfiguration = vscode.workspace.getConfiguration('git-graph');
    }
    autoCenterCommitDetailsView() {
        return this.workspaceConfiguration.get('autoCenterCommitDetailsView', true);
    }
    combineLocalAndRemoteBranchLabels() {
        return this.workspaceConfiguration.get('combineLocalAndRemoteBranchLabels', true);
    }
    commitDetailsViewLocation() {
        return this.workspaceConfiguration.get('commitDetailsViewLocation', 'Inline');
    }
    customBranchGlobPatterns() {
        let inPatterns = this.workspaceConfiguration.get('customBranchGlobPatterns', []);
        let outPatterns = [];
        for (let i = 0; i < inPatterns.length; i++) {
            if (typeof inPatterns[i].name === 'string' && typeof inPatterns[i].glob === 'string') {
                outPatterns.push({ name: inPatterns[i].name, glob: '--glob=' + inPatterns[i].glob });
            }
        }
        return outPatterns;
    }
    dateFormat() {
        return this.workspaceConfiguration.get('dateFormat', 'Date & Time');
    }
    dateType() {
        return this.workspaceConfiguration.get('dateType', 'Author Date');
    }
    defaultColumnVisibility() {
        let obj = this.workspaceConfiguration.get('defaultColumnVisibility', {});
        if (typeof obj === 'object' && obj !== null && typeof obj['Date'] === 'boolean' && typeof obj['Author'] === 'boolean' && typeof obj['Commit'] === 'boolean') {
            return { author: obj['Author'], commit: obj['Commit'], date: obj['Date'] };
        }
        else {
            return { author: true, commit: true, date: true };
        }
    }
    fetchAvatars() {
        return this.workspaceConfiguration.get('fetchAvatars', false);
    }
    graphColours() {
        return this.workspaceConfiguration.get('graphColours', ['#0085d9', '#d9008f', '#00d90a', '#d98500', '#a300d9', '#ff0000'])
            .filter((v) => v.match(/^\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}|rgb[a]?\s*\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))\s*$/) !== null);
    }
    graphStyle() {
        return this.workspaceConfiguration.get('graphStyle', 'rounded');
    }
    initialLoadCommits() {
        return this.workspaceConfiguration.get('initialLoadCommits', 300);
    }
    loadMoreCommits() {
        return this.workspaceConfiguration.get('loadMoreCommits', 75);
    }
    maxDepthOfRepoSearch() {
        return this.workspaceConfiguration.get('maxDepthOfRepoSearch', 0);
    }
    openDiffTabLocation() {
        return this.workspaceConfiguration.get('openDiffTabLocation', 'Active') === 'Active' ? vscode.ViewColumn.Active : vscode.ViewColumn.Beside;
    }
    refLabelAlignment() {
        return this.workspaceConfiguration.get('referenceLabelAlignment', 'Normal');
    }
    retainContextWhenHidden() {
        return this.workspaceConfiguration.get('retainContextWhenHidden', false);
    }
    showCurrentBranchByDefault() {
        return this.workspaceConfiguration.get('showCurrentBranchByDefault', false);
    }
    showStatusBarItem() {
        return this.workspaceConfiguration.get('showStatusBarItem', true);
    }
    showUncommittedChanges() {
        return this.workspaceConfiguration.get('showUncommittedChanges', true);
    }
    tabIconColourTheme() {
        return this.workspaceConfiguration.get('tabIconColourTheme', 'colour');
    }
    gitPath() {
        let path = vscode.workspace.getConfiguration('git').get('path', null);
        return path !== null ? path : 'git';
    }
}
function getConfig() {
    return new Config();
}
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map