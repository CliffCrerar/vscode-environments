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
const vscode = require("vscode");
const utils_1 = require("./utils");
const angular_config_1 = require("./angular-config");
class Generate {
    constructor(contextPath, workspacePath) {
        this.path = '';
        this.project = '';
        this.schema = '';
        this.defaultOption = '';
        this.base = 'ng g';
        this.collection = angular_config_1.AngularConfig.cliCollection;
        this.options = new Map();
        this.cliLocal = null;
        this.path = this.getCommandPath(contextPath);
        this.project = this.getProject(contextPath, workspacePath);
    }
    get command() {
        return [
            this.base,
            this.formatCollectionAndSchema(),
            this.defaultOption,
            ...this.formatOptionsForCommand()
        ].join(' ');
    }
    addCollection(name) {
        this.collection = name;
    }
    addSchema(name) {
        this.schema = name;
    }
    addDefaultOption(value, withPath = true) {
        this.defaultOption = value;
        if (withPath && this.project && this.project !== angular_config_1.AngularConfig.rootProject) {
            this.addOption('project', this.project);
        }
    }
    addOption(optionName, optionValue) {
        this.options.set(optionName, optionValue);
    }
    askConfirmation() {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmationText = `Confirm`;
            const cancellationText = `Cancel`;
            const choice = yield vscode.window.showQuickPick([confirmationText, cancellationText], {
                placeHolder: this.command,
                ignoreFocusOut: true,
            });
            return (choice === confirmationText) ? true : false;
        });
    }
    isCliLocal(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cliLocal === null) {
                this.cliLocal = yield utils_1.Utils.existsAsync(utils_1.Utils.getNodeModulesPath(cwd, '.bin', 'ng'));
            }
            return this.cliLocal;
        });
    }
    getExecCommand(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.isCliLocal(cwd)) ? `"./node_modules/.bin/ng"${this.command.substr(2)}` : this.command;
        });
    }
    resetCommandPath(contextPath = '') {
        this.path = this.getCommandPath(contextPath);
    }
    getProject(contextPath, workspacePath) {
        const projectPath = contextPath.substr(contextPath.indexOf(workspacePath) + workspacePath.length);
        const pathNormalized = utils_1.Utils.normalizePath(projectPath);
        for (const [projectName, projectPath] of angular_config_1.AngularConfig.projects) {
            /* Remove leading "/" to match */
            const pathWithoutLeadingSlash = pathNormalized.substr(1);
            /* Test strict equality or starting with a trailing "/", to avoid collision when projects start with a common path */
            if (pathWithoutLeadingSlash === projectPath || pathWithoutLeadingSlash.startsWith(`${projectPath}/`)) {
                return projectName;
            }
        }
        const projectMatches = pathNormalized.match(/projects\/([^\/]+)\/[^\/]+\/(?:app|lib)/);
        if (projectMatches) {
            return projectMatches[1];
        }
        else {
            const scopedProjectMatches = pathNormalized.match(/projects\/([^\/]+\/[^\/]+)\/[^\/]+\/(?:app|lib)/);
            if (scopedProjectMatches) {
                return `@${scopedProjectMatches[1]}`;
            }
        }
        return '';
    }
    getCommandPath(contextPath = '') {
        const pathNormalized = utils_1.Utils.normalizePath(contextPath);
        const contextPathMatches = pathNormalized.match(/[^\/]+\/((?:app|lib))\//);
        if (contextPathMatches) {
            const splittedPath = pathNormalized.split(`/${contextPathMatches[1]}/`)[1];
            if (splittedPath.includes('.')) {
                /* Special case: ngx-spec works on a existing file, so it needs the full path */
                if (this.collection === 'ngx-spec') {
                    return splittedPath;
                }
                /* If filename, delete filename by removing everything after the last "/" */
                return utils_1.Utils.getDirectoryFromFilename(splittedPath);
            }
            else {
                /* If directory, add a trailing "/" */
                return `${splittedPath}/`;
            }
        }
        return '';
    }
    formatOptionsForCommand() {
        return Array.from(this.options.entries())
            .map((option) => {
            if (option[1] === 'true') {
                return `--${option[0]}`;
            }
            else if (Array.isArray(option[1])) {
                return option[1].map((optionItem) => `--${option[0]} ${optionItem}`).join(' ');
            }
            else {
                return `--${option[0]} ${option[1]}`;
            }
        });
    }
    formatCollectionAndSchema() {
        return (this.collection !== angular_config_1.AngularConfig.cliCollection) ?
            `${this.collection}:${this.schema}` :
            this.schema;
    }
}
exports.Generate = Generate;
//# sourceMappingURL=generate.js.map