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
const fs = require("fs");
const globby = require("globby");
const hasha = require("hasha");
const ignoreToArray = require("parse-gitignore");
const config_1 = require("../config");
const common_1 = require("./common");
var StateType;
(function (StateType) {
    StateType["DEPLOYING"] = "DEPLOYING";
    StateType["DEPLOYMENT_ERROR"] = "DEPLOYMENT_ERROR";
    StateType["BOOTED"] = "BOOTED";
    StateType["BUILDING"] = "BUILDING";
    StateType["READY"] = "READY";
    StateType["BUILD_ERROR"] = "BUILD_ERROR";
    StateType["FROZEN"] = "FROZEN";
})(StateType = exports.StateType || (exports.StateType = {}));
var DeploymentTypeType;
(function (DeploymentTypeType) {
    DeploymentTypeType["NPM"] = "NPM";
    DeploymentTypeType["DOCKER"] = "DOCKER";
    DeploymentTypeType["STATIC"] = "STATIC";
})(DeploymentTypeType = exports.DeploymentTypeType || (exports.DeploymentTypeType = {}));
function createDeployment(progress, folder, name, deploymentType) {
    return __awaiter(this, void 0, void 0, function* () {
        const nowConfig = common_1.requireFile(path.resolve(folder, 'now.json'));
        let whitelist = nowConfig.files;
        const files = [];
        let globbyPatterns = ['*/**'];
        const globbyOptions = {
            cwd: folder,
            absolute: true,
            ignore: ['.hg', '.git', '.gitmodules', '.svn', '.npmignore', '.dockerignore', '.gitignore', '.*.swp', '.DS_Store', '.wafpicke-*', '.lock-wscript', 'npm-debug.log', 'config.gypi', 'node_modules', 'CVS'],
            gitignore: false
        };
        if (deploymentType === DeploymentTypeType.NPM) {
            const pkg = common_1.requireFile(path.resolve(folder, 'package.json'));
            whitelist = whitelist || pkg.files || (pkg.now && pkg.now.files);
            if (!whitelist) {
                const npmIgnore = common_1.mayBeRead(path.resolve(folder, '.npmignore'));
                if (npmIgnore) {
                    globbyOptions.ignore.push(...ignoreToArray(npmIgnore));
                }
                else {
                    globbyOptions.gitignore = true;
                }
            }
            globbyOptions.ignore.push('package.json');
            files.push(path.resolve(folder, 'package.json'));
        }
        else if (deploymentType === DeploymentTypeType.DOCKER) {
            if (!whitelist) {
                const dockerIgnore = common_1.mayBeRead(path.resolve(folder, '.dockerignore'));
                if (dockerIgnore) {
                    globbyOptions.ignore.push(...ignoreToArray(dockerIgnore));
                }
                else {
                    globbyOptions.gitignore = true;
                }
            }
            globbyOptions.ignore.push('Dockerfile');
            files.push(path.resolve(folder, 'Dockerfile'));
        }
        else if (deploymentType === DeploymentTypeType.STATIC) {
            if (!whitelist) {
                globbyOptions.ignore.push(...['now.json', 'package.json', 'Dockerfile']);
                globbyOptions.gitignore = true;
            }
        }
        if (whitelist) {
            globbyPatterns.push(...whitelist);
        }
        files.push(...(yield globby(globbyPatterns, globbyOptions)));
        const filesInfo = yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
            return {
                file,
                sha: yield hasha.fromFile(file, {
                    encoding: 'hex',
                    algorithm: 'sha1'
                }),
                size: fs.statSync(file).size
            };
        })));
        for (const file of filesInfo) {
            progress.report({ message: `Uploading ${common_1.absoluteToRelative(folder, file.file)}...` });
            yield common_1.request('POST', config_1.default.ENDPOINTS.UPLOAD_FILES, true, fs.readFileSync(file.file, 'utf8'), null, {
                'Content-Type': 'application/octet-stream',
                'x-now-digest': file.sha,
                'x-now-size': file.size,
                'Content-Length': file.size
            });
        }
        progress.report({ message: 'Creation of the deployment...' });
        const response = yield common_1.request('POST', config_1.default.ENDPOINTS.NEW_DEPLOYMENT, true, {
            public: false,
            name,
            deploymentType,
            files: filesInfo.map(file => ({
                file: common_1.absoluteToRelative(folder, file.file),
                sha: file.sha,
                size: file.size
            }))
        });
        return response.url;
    });
}
exports.createDeployment = createDeployment;
function deleteDeployment(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield common_1.request('DELETE', config_1.default.ENDPOINTS.DEPLOYMENTS + '/' + id, true);
    });
}
exports.deleteDeployment = deleteDeployment;
function getDeployments() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield common_1.request('GET', config_1.default.ENDPOINTS.DEPLOYMENTS, true);
        return response.deployments;
    });
}
exports.getDeployments = getDeployments;
function setAlias(deployment, alias) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield common_1.request('POST', config_1.default.ENDPOINTS.DEPLOYMENTS + `/${deployment.uid}/aliases`, true, { alias });
    });
}
exports.setAlias = setAlias;
//# sourceMappingURL=deployments.js.map