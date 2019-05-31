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
const path = require("path");
const vscode = require("vscode");
const utils_1 = require("./utils");
class AngularConfig {
    static init(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const configPath = path.join(cwd, this.configPath);
            if (!this.config && (yield utils_1.Utils.existsAsync(configPath))) {
                this.config = yield utils_1.Utils.parseJSONFile(configPath);
                this.defaultCollection = this.getDefaultCollection(this.config);
                this.projects = this.getProjects(this.config);
                if (!this.watcher) {
                    /* Listen to change in config file to update config */
                    this.watcher = vscode.workspace.createFileSystemWatcher(configPath, true, undefined, true);
                    this.watcher.onDidChange(() => {
                        this.config = null;
                        this.init(cwd);
                    });
                }
            }
        });
    }
    static getDefaultCollection(config) {
        if (config && config.cli) {
            if (config.cli.defaultCollection) {
                return config.cli.defaultCollection;
            }
            else if (config.cli.schematics && config.cli.schematics.defaultCollection) {
                return config.cli.schematics.defaultCollection;
            }
        }
        return this.cliCollection;
    }
    static getProjects(config) {
        const projects = new Map();
        if (config && config.projects) {
            for (const projectName in config.projects) {
                if (config.projects.hasOwnProperty(projectName)) {
                    /* The main application will have an empty root but should have a "src" sourceRoot */
                    let projectPath = config.projects[projectName].root || config.projects[projectName].sourceRoot;
                    /* If both are empty, we can't detect the project path so we don't add it to the list */
                    if (projectPath) {
                        /* Angular CLI inconsistently adds a trailing "/" on some projects paths */
                        projectPath = projectPath.endsWith('/') ? projectPath.slice(0, -1) : projectPath;
                        if (projectPath === 'src') {
                            this.rootProject = projectName;
                        }
                        projects.set(projectName, projectPath);
                    }
                }
            }
        }
        return projects;
    }
}
AngularConfig.configPath = 'angular.json';
AngularConfig.cliCollection = '@schematics/angular';
AngularConfig.defaultCollection = '@schematics/angular';
AngularConfig.projects = new Map();
AngularConfig.rootProject = '';
AngularConfig.config = null;
exports.AngularConfig = AngularConfig;
//# sourceMappingURL=angular-config.js.map