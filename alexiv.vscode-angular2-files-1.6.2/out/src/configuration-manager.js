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
const vscode_1 = require("vscode");
const fs = require("fs");
const cli_config_1 = require("./config/cli-config");
const promisify_1 = require("./promisify");
const deep_merge_1 = require("./deep-merge");
const readFileAsync = promisify_1.promisify(fs.readFile);
class ConfigurationManager {
    constructor() {
        this.currentRootPath = null;
        this.CONFIG_FILES = ['.angular-cli.json', 'angular.json'];
    }
    readConfigFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield vscode_1.workspace.findFiles('{**/.angular-cli.json,**/angular.json}', '', 1);
            this.currentRootPath = vscode_1.workspace.rootPath;
            if (files.length > 0) {
                const [{ 'fsPath': filePath }] = files;
                const data = yield readFileAsync(filePath, 'utf8');
                let config = {};
                // prevent parsing issues
                try {
                    config = JSON.parse(data);
                }
                catch (ex) {
                    vscode_1.window.showErrorMessage('Invalid schema detected in .angular-cli.json, please correct and try again!');
                    throw Error('Invalid schema');
                }
                return config;
            }
            return cli_config_1.config;
        });
    }
    parseConfig(config) {
        if (config.hasOwnProperty('projects')) {
            const oldConfig = JSON.parse(JSON.stringify(cli_config_1.config));
            const newConfig = config;
            const globalConfig = this.parseSchematicsConfig(newConfig);
            const project = newConfig.projects[newConfig.defaultProject];
            const projectConfig = this.parseSchematicsConfig(project);
            const prefix = project ? project.prefix : null;
            oldConfig.apps[0].prefix = prefix || oldConfig.apps[0].prefix;
            // replace global config with project config
            deep_merge_1.default(oldConfig, globalConfig, projectConfig);
            oldConfig.defaults.styleExt = oldConfig.defaults.component.styleext || oldConfig.defaults.styleExt;
            oldConfig.version = 'ng6';
            return oldConfig;
        }
        return deep_merge_1.default({}, cli_config_1.config, config);
    }
    parseSchematicsConfig(cfg) {
        if (cfg && cfg.schematics) {
            const templateConfig = JSON.parse(JSON.stringify(cli_config_1.config));
            const config = {
                defaults: {
                    styleExt: '',
                },
            };
            for (const key of Object.keys(cfg.schematics)) {
                const normalizedKey = key.replace('@schematics/angular:', '');
                for (const prop of Object.keys(cfg.schematics[key])) {
                    if (templateConfig.defaults[normalizedKey] && templateConfig.defaults[normalizedKey].hasOwnProperty(prop)) {
                        if (!config.defaults.hasOwnProperty(normalizedKey)) {
                            config.defaults[normalizedKey] = {};
                        }
                        config.defaults[normalizedKey][prop] = cfg.schematics[key][prop];
                    }
                }
            }
            config.defaults.styleExt = templateConfig.defaults.component.styleext || templateConfig.defaults.styleExt;
            return config;
        }
        return null;
    }
    getConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const configFile = yield this.readConfigFile();
            return this.parseConfig(configFile);
        });
    }
    watchConfigFiles(callback) {
        if (vscode_1.workspace.rootPath) {
            fs.watch(vscode_1.workspace.rootPath, (eventType, filename) => {
                if (this.CONFIG_FILES.includes(filename)) {
                    callback();
                }
            });
        }
    }
}
exports.ConfigurationManager = ConfigurationManager;
//# sourceMappingURL=configuration-manager.js.map