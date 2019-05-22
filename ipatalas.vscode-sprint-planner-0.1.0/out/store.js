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
const Constants = require("./constants");
const stopwatch_1 = require("./utils/stopwatch");
const textProcessor_1 = require("./utils/textProcessor");
const MissingUrlOrToken = "Missing URL or token in configuration";
class SessionStore {
    constructor(azureClient, config, logger) {
        this.azureClient = azureClient;
        this.config = config;
        this.logger = logger;
        this.fetchingActivityTypes = false;
        this.userStories = undefined;
    }
    setIteration() {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = vsc.window.activeTextEditor;
            if (editor) {
                const lines = editor.document.getText().split(Constants.NewLineRegex);
                const it = textProcessor_1.TextProcessor.getIteration(lines, 0);
                if (!it) {
                    this.customIteration = undefined;
                    this.logger.log('Iteration not specified - will default to @CurrentIteration');
                }
                else {
                    this.customIteration = this.iterations.find(x => x.id === it.id);
                    if (!this.customIteration) {
                        return Promise.resolve();
                    }
                    this.logger.log(`Iteration set to ${this.customIteration.path.toString()}`);
                    vsc.window.setStatusBarMessage(`Iteration set to ${this.customIteration.path.toString()}`, 2000);
                }
            }
            return Promise.resolve();
        });
    }
    ensureHasActivityTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.activityTypes !== undefined) {
                return Promise.resolve();
            }
            if (!this.config.isValid) {
                return Promise.reject(MissingUrlOrToken);
            }
            if (this.fetchingActivityTypes) {
                return Promise.reject();
            }
            this.fetchingActivityTypes = true;
            try {
                let total = stopwatch_1.Stopwatch.startNew();
                this.activityTypes = yield this.azureClient.getActivityTypes();
                total.stop();
                this.logger.log(`Activity types fetched in ${total.toString()} (1 request)`);
            }
            catch (err) {
                if (err.response) {
                    console.error(`${err.response.data}`);
                }
                this.fetchingActivityTypes = false;
                return Promise.reject(err);
            }
            this.fetchingActivityTypes = false;
            return Promise.resolve();
        });
    }
    ensureHasIterations() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.iterations !== undefined) {
                return Promise.resolve();
            }
            if (!this.config.isValid) {
                return Promise.reject(MissingUrlOrToken);
            }
            try {
                let total = stopwatch_1.Stopwatch.startNew();
                this.iterations = yield this.azureClient.getIterationsInfo();
                total.stop();
                this.logger.log(`Iterations fetched in ${total.toString()} (1 request)`);
                vsc.window.setStatusBarMessage(`Iterations fetched in ${total.toString()} (1 request)`, 2000);
            }
            catch (err) {
                if (err.response) {
                    console.error(`${err.response.data}`);
                }
                return Promise.reject(err);
            }
            return Promise.resolve();
        });
    }
    ensureHasUserStories() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.isValid) {
                return Promise.reject(MissingUrlOrToken);
            }
            try {
                let total = stopwatch_1.Stopwatch.startNew();
                let iteration;
                this.setIteration();
                if (!this.customIteration) {
                    this.currentIteration = this.currentIteration || (yield this.azureClient.getCurrentIterationInfo());
                    iteration = this.currentIteration;
                    this.logger.log(`Iteration defaulted to ${this.currentIteration.path.toString()}`);
                }
                else {
                    this.currentIteration = undefined;
                    iteration = this.customIteration;
                }
                const workItemsIds = yield this.azureClient.getIterationWorkItems(iteration.id);
                if (workItemsIds.length === 0) {
                    this.logger.log(`No user stories found in iteration`);
                    return Promise.reject();
                }
                this.userStories = yield this.azureClient.getUserStoryInfo(workItemsIds.map(x => x.id));
                total.stop();
                this.logger.log(`User stories fetched in ${total.toString()} (3 requests)`);
                vsc.window.setStatusBarMessage(`User stories fetched in ${total.toString()} (3 requests)`, 2000);
            }
            catch (err) {
                if (err.response) {
                    console.error(`${err.response.data}`);
                }
                return Promise.reject(err);
            }
            return Promise.resolve();
        });
    }
}
exports.SessionStore = SessionStore;
//# sourceMappingURL=store.js.map