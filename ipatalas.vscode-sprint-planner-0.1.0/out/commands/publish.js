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
const vsc = require("vscode");
const Constants = require("../constants");
const textProcessor_1 = require("../utils/textProcessor");
class PublishCommand {
    constructor(sessionStore, client, logger, config) {
        this.sessionStore = sessionStore;
        this.client = client;
        this.logger = logger;
        this.config = config;
    }
    publish(line) {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = vsc.window.activeTextEditor;
            if (!editor) {
                return;
            }
            try {
                let currentLine = line !== undefined ? line : editor.selection.active.line;
                const lines = editor.document.getText().split(Constants.NewLineRegex);
                const us = textProcessor_1.TextProcessor.getUserStory(lines, currentLine);
                if (!us) {
                    return console.log('Cannot find user story info');
                }
                yield this.sessionStore.ensureHasUserStories();
                const userStoryInfo = this.sessionStore.userStories.find(x => x.id === us.id);
                if (!userStoryInfo) {
                    return console.log(`US#${us.id} is not present in session cache, is the ID correct?`);
                }
                const taskIds = userStoryInfo.taskUrls.map(this.extractTaskId).filter(x => x);
                const maxStackRank = yield this.client.getMaxTaskStackRank(taskIds);
                const requests = us.tasks.map((t, i) => this.buildTaskInfo(t, userStoryInfo, maxStackRank + i + 1));
                yield Promise.all(requests.map(r => this.client.createTask(r)));
                vsc.window.showInformationMessage(`Published ${us.tasks.length} tasks for US#${us.id}`);
            }
            catch (err) {
                if (err) {
                    vsc.window.showErrorMessage(err.message);
                    this.logger.log(err);
                }
            }
        });
    }
    extractTaskId(url) {
        const m = Constants.WorkItemIdFromUrl.exec(url);
        return m && parseInt(m[1]);
    }
    buildTaskInfo(task, userStory, stackRank) {
        return {
            title: task.title,
            description: task.description,
            areaPath: userStory.areaPath,
            teamProject: userStory.teamProject,
            iterationPath: userStory.iterationPath,
            activity: task.activity || this.config.defaultActivity,
            estimation: task.estimation,
            userStoryUrl: userStory.url,
            stackRank: stackRank
        };
    }
}
exports.PublishCommand = PublishCommand;
//# sourceMappingURL=publish.js.map