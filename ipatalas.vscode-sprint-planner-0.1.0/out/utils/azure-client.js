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
const axios_1 = require("axios");
const stopwatch_1 = require("./stopwatch");
class AzureClient {
    constructor(config, logger) {
        this.logger = logger;
        this._apiVersionPreview = {
            'api-version': '5.0-preview.1'
        };
        this._interceptors = [];
        this.recreateClient(config);
        this._eventHandler = config.onDidChange(cfg => this.recreateClient(cfg));
    }
    dispose() {
        this._eventHandler.dispose();
    }
    recreateClient(config) {
        if (this._interceptors.length > 0) {
            this._interceptors.forEach(id => {
                this.client.interceptors.response.eject(id);
                this.teamClient.interceptors.response.eject(id);
            });
            this._interceptors = [];
        }
        let organization = encodeURIComponent(config.organization);
        let project = encodeURIComponent(config.project);
        let team = encodeURIComponent(config.team);
        const clientFactory = (baseUrl) => {
            const client = axios_1.default.create({
                baseURL: baseUrl,
                auth: {
                    username: "PAT",
                    password: config.token || ""
                },
                params: {
                    'api-version': "5.0"
                },
                validateStatus: status => status === 200
            });
            if (config.debug) {
                const id = client.interceptors.response.use(res => this.logRequest(res.request, res), err => this.logRequest(err.request, Promise.reject(err)));
                this._interceptors.push(id);
            }
            return client;
        };
        this.client = clientFactory(`https://dev.azure.com/${organization}/${project}/_apis/`);
        this.teamClient = clientFactory(`https://dev.azure.com/${organization}/${project}/${team}/_apis/`);
    }
    logRequest(request, returnValue) {
        console.log(`[DEBUG] ${request.method.toUpperCase()} ${request.path}`);
        return returnValue;
    }
    getIterationsInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const finish = this.logger.perf('Getting iterations info...');
            const result = yield this.teamClient.get("/work/teamsettings/iterations");
            finish();
            if (result.data.count > 0) {
                let iterations = [];
                result.data.value.forEach(element => {
                    const iteration = {
                        id: element.id,
                        name: element.name,
                        path: element.path
                    };
                    iterations.push(iteration);
                });
                return iterations;
            }
            throw new Error("Iterations not found");
        });
    }
    getCurrentIterationInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const finish = this.logger.perf('Getting current iteration info...');
            const result = yield this.teamClient.get("/work/teamsettings/iterations?$timeframe=current");
            finish();
            if (result.data.count > 0) {
                const iteration = result.data.value[0];
                return {
                    id: iteration.id,
                    name: iteration.name,
                    path: iteration.path
                };
            }
            throw new Error("Current iteration not found");
        });
    }
    getIterationWorkItems(iterationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const finish = this.logger.perf('Getting user stories for iteration...');
            const result = yield this.teamClient.get(`/work/teamsettings/iterations/${iterationId}/workitems`, {
                params: Object.assign({}, this._apiVersionPreview)
            });
            finish();
            return result.data.workItemRelations.filter(x => x.rel === null).map(x => ({
                id: x.target.id,
                url: x.target.url
            }));
        });
    }
    getActivityTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            const finish = this.logger.perf('Getting activity types...');
            const result = yield this.client.get(`/wit/workitemtypes/Task/fields/Microsoft.VSTS.Common.Activity?$expand=All`);
            finish();
            return result.data.allowedValues;
        });
    }
    getUserStoryInfo(userStoryIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const finish = this.logger.perf('Getting user story info...');
            const params = {
                ids: userStoryIds.join(','),
                '$expand': 'Relations'
            };
            const result = yield this.client.get('/wit/workitems', { params });
            finish();
            return result.data.value
                .filter(x => x.fields["System.WorkItemType"] === "User Story")
                .map(x => ({
                id: x.id,
                url: x.url,
                title: x.fields["System.Title"],
                areaPath: x.fields["System.AreaPath"],
                teamProject: x.fields["System.TeamProject"],
                iterationPath: x.fields["System.IterationPath"],
                taskUrls: (x.relations) && x.relations.filter(r => r.rel === 'System.LinkTypes.Hierarchy-Forward').map(r => r.url) || []
            }));
        });
    }
    getMaxTaskStackRank(taskIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (taskIds.length === 0) {
                this.logger.log('No tasks in User Story -> Stack Rank = 0');
                return 0;
            }
            const finish = this.logger.perf('Getting max stack rank for tasks...');
            const params = {
                ids: taskIds.join(','),
                fields: ['Microsoft.VSTS.Common.StackRank'].join(',')
            };
            const result = yield this.client.get('/wit/workitems', { params });
            const stackRanks = result.data.value.map(t => t.fields["Microsoft.VSTS.Common.StackRank"]);
            finish();
            const max = stackRanks.reduce((acc, current) => {
                acc = Math.max(acc, current || 0);
                return acc;
            }, 0);
            this.logger.log(`Max Stack Rank: ${max}`);
            return max;
        });
    }
    createTask(task) {
        const request = [
            this.addOperation('/fields/System.Title', task.title),
            this.addOperation('/fields/System.AreaPath', task.areaPath),
            this.addOperation('/fields/System.TeamProject', task.teamProject),
            this.addOperation('/fields/System.IterationPath', task.iterationPath),
            this.addOperation('/fields/Microsoft.VSTS.Common.Activity', task.activity),
            this.addOperation('/fields/Microsoft.VSTS.Common.StackRank', task.stackRank),
            this.addOperation('/relations/-', this.userStoryLink(task.userStoryUrl)),
        ];
        if (task.description && task.description.length > 0) {
            request.push(this.addOperation('/fields/System.Description', `<div>${task.description.join("</div><div>")}</div>`));
        }
        if (task.estimation) {
            request.push(...[
                this.addOperation('/fields/Microsoft.VSTS.Scheduling.RemainingWork', task.estimation),
                this.addOperation('/fields/Microsoft.VSTS.Scheduling.OriginalEstimate', task.estimation)
            ]);
        }
        this.logger.log(`Creating task: ${task.title}...`);
        let stopwatch = stopwatch_1.Stopwatch.startNew();
        return this.client.post('/wit/workitems/$Task', request, {
            headers: {
                'Content-Type': 'application/json-patch+json'
            }
        }).then(res => {
            this.logger.log(`#${res.data.id} Task '${task.title}' created (${stopwatch.toString()})`);
            return res.data.id;
        })
            .catch(err => {
            console.error(err);
            return -1;
        });
    }
    addOperation(path, value) {
        return {
            op: 'add',
            path,
            value
        };
    }
    userStoryLink(url) {
        return {
            rel: "System.LinkTypes.Hierarchy-Reverse",
            url
        };
    }
}
exports.AzureClient = AzureClient;
//# sourceMappingURL=azure-client.js.map