"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageId = 'planner';
exports.NewLineRegex = /\r?\n/g;
exports.ActivityTypeTriggerRegex = /^[a-z]*$/i;
exports.ActivityTypeLine = /^[a-z]+:$/i;
exports.IterationPrefix = 'IT#';
exports.IterationRegex = /^IT#([\da-f]{8}(?:\-[\da-f]{4}){3}\-[\da-f]{12})/i;
exports.UserStoryPrefix = 'US#';
exports.UserStoryRegex = /^US#(\d+)/;
exports.EndOfUserStoryRegex = /^(---|\s*)$/;
exports.TaskPrefixRegex = /^\s*[-*]\s*/;
exports.TaskEstimationRegex = /(\s*[,-]\s*(?<estimation>\d+)h?)$/;
exports.TaskLinesSplitter = /\r?\n(?!\t)/; // tab in negative look-ahead assertion is for task descriptions which should be indented by a tab
exports.WorkItemIdFromUrl = /\/workItems\/(\d+)/;
exports.Commands = {
    publish: 'sprintplanner.publish'
};
//# sourceMappingURL=constants.js.map