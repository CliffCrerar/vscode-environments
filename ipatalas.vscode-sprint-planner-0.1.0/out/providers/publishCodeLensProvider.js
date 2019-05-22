"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vsc = require("vscode");
const constants_1 = require("../constants");
const textProcessor_1 = require("../utils/textProcessor");
class PublishCodeLensProvider {
    provideCodeLenses(_document, _token) {
        const editor = vsc.window.activeTextEditor;
        const lines = editor.document.getText().split(constants_1.NewLineRegex);
        const userStoryLines = textProcessor_1.TextProcessor.getUserStoryLineIndices(lines);
        return userStoryLines.map(line => {
            const us = textProcessor_1.TextProcessor.getUserStory(lines, line);
            return new vsc.CodeLens(new vsc.Range(line, 0, line, lines[line].length), {
                title: `Publish to Azure DevOps, ${this.buildExtraInfo(us)}`,
                command: constants_1.Commands.publish,
                arguments: [line]
            });
        });
    }
    buildExtraInfo({ tasks }) {
        const totalHours = tasks.filter(t => t.estimation)
            .map(t => t.estimation)
            .reduce((sum, hours) => {
            sum += hours;
            return sum;
        }, 0);
        if (tasks.length === 0) {
            return 'no tasks';
        }
        const tasksText = tasks.length === 1 ? 'task' : 'tasks';
        return `${tasks.length} ${tasksText} (${totalHours}h)`;
    }
}
exports.PublishCodeLensProvider = PublishCodeLensProvider;
//# sourceMappingURL=publishCodeLensProvider.js.map