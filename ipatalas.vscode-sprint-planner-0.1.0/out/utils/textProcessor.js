"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants = require("../constants");
const os_1 = require("os");
class TextProcessor {
    static getUserStoryLineIndices(allLines) {
        const results = [];
        for (let i = 0; i < allLines.length; i++) {
            if (Constants.UserStoryRegex.test(allLines[i])) {
                results.push(i);
            }
        }
        return results;
    }
    static getIteration(allLines, currentLine) {
        const iterationInfo = TextProcessor.getIterationInfo(allLines, currentLine);
        if (!iterationInfo) {
            return;
        }
        return {
            line: iterationInfo[0],
            id: iterationInfo[1]
        };
    }
    static getIterationInfo(lines, currentLine) {
        for (; currentLine >= 0; currentLine--) {
            const id = TextProcessor.getIterationID(lines[currentLine]);
            if (id) {
                return [currentLine, id];
            }
        }
    }
    static getIterationID(line) {
        console.log('Getting Iteration Id');
        const match = Constants.IterationRegex.exec(line);
        return match !== null && match[1];
    }
    static getUserStory(allLines, currentLine) {
        const userStoryInfo = TextProcessor.getUserStoryInfo(allLines, currentLine);
        if (!userStoryInfo) {
            return;
        }
        const [usLine] = userStoryInfo;
        const tasks = TextProcessor.getTasksInfo(allLines, usLine + 1);
        return {
            line: userStoryInfo[0],
            id: userStoryInfo[1],
            tasks
        };
    }
    static getUserStoryInfo(lines, currentLine) {
        for (; currentLine >= 0; currentLine--) {
            const id = TextProcessor.getUserStoryID(lines[currentLine]);
            if (id) {
                return [currentLine, parseInt(id)];
            }
        }
    }
    static getTasksInfo(lines, currentLine) {
        const firstTaskLine = currentLine;
        let lastTaskLine = lines.length - 1;
        // find user story breaking pattern
        for (; currentLine < lines.length; currentLine++) {
            if (TextProcessor.isEndOfUserStory(lines[currentLine])) {
                lastTaskLine = currentLine - 1;
                break;
            }
        }
        if (firstTaskLine <= lastTaskLine) {
            const taskLines = lines
                .slice(firstTaskLine, lastTaskLine + 1)
                .join(os_1.EOL)
                .split(Constants.TaskLinesSplitter);
            const tasks = [];
            let activity = undefined;
            for (const line of taskLines) {
                if (this.isActivityLine(line)) {
                    activity = line.substr(0, line.length - 1);
                }
                else {
                    tasks.push(this.getTask(line, activity));
                }
            }
            return tasks;
        }
        return [];
    }
    static getTask(taskLine, activity) {
        let [title, ...description] = taskLine.split(os_1.EOL);
        const task = {};
        title = title.replace(Constants.TaskPrefixRegex, '');
        const match = title.match(Constants.TaskEstimationRegex);
        if (match !== null) {
            task.estimation = parseInt(match.groups.estimation);
            title = title.replace(match[0], '');
        }
        task.title = title;
        task.description = description.map(d => d.trimLeft());
        task.activity = activity;
        return task;
    }
    static getUserStoryID(line) {
        const match = Constants.UserStoryRegex.exec(line);
        return match !== null && match[1];
    }
    static isEndOfUserStory(line) {
        let isEndOfUserStory = Constants.EndOfUserStoryRegex.test(line) || Constants.UserStoryRegex.test(line);
        return isEndOfUserStory;
    }
    static isActivityLine(line) {
        return Constants.ActivityTypeLine.test(line);
    }
}
exports.TextProcessor = TextProcessor;
//# sourceMappingURL=textProcessor.js.map