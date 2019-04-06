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
const execa = require("execa");
const path_1 = require("path");
const sander = require("sander");
// tslint:disable-next-line:no-implicit-dependencies
const vscode = require("vscode");
const wrap = require("wrap-ansi");
let channel;
function getConfiguration() {
    const config = vscode.workspace.getConfiguration().get('commitizen');
    return config;
}
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        channel = vscode.window.createOutputChannel('commitizen');
        channel.appendLine('Commitizen support started');
        const czConfig = yield readCzConfig();
        context.subscriptions.push(vscode.commands.registerCommand('vscode-commitizen.commit', () => __awaiter(this, void 0, void 0, function* () {
            const ccm = new ConventionalCommitMessage(czConfig);
            yield ccm.getType();
            yield ccm.getScope();
            yield ccm.getSubject();
            yield ccm.getBody();
            yield ccm.getBreaking();
            yield ccm.getFooter();
            if (ccm.complete && vscode.workspace.workspaceFolders) {
                yield commit(vscode.workspace.workspaceFolders[0].uri.fsPath, ccm.message.trim());
            }
        })));
    });
}
exports.activate = activate;
function readCzConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const pkg = yield readPackageJson();
        if (!pkg) {
            return undefined;
        }
        if (!vscode.workspace.workspaceFolders) {
            return undefined;
        }
        let configPath = path_1.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.cz-config.js');
        if (hasCzConfig(pkg)) {
            configPath = path_1.join(vscode.workspace.workspaceFolders[0].uri.fsPath, pkg.config['cz-customizable'].config);
        }
        if (!(yield sander.exists(configPath))) {
            return undefined;
        }
        return require(configPath);
    });
}
function readPackageJson() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode.workspace.workspaceFolders) {
            return undefined;
        }
        const pkgPath = path_1.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'package.json');
        if (!(yield sander.exists(pkgPath))) {
            return undefined;
        }
        return JSON.parse(yield sander.readFile(pkgPath));
    });
}
function hasCzConfig(pkg) {
    return pkg.config && pkg.config['cz-customizable'] && pkg.config['cz-customizable'].config;
}
function askOneOf(question, picks, save, customLabel, customQuestion) {
    return __awaiter(this, void 0, void 0, function* () {
        const pickOptions = {
            placeHolder: question,
            ignoreFocusOut: true,
            matchOnDescription: true,
            matchOnDetail: true
        };
        const pick = yield vscode.window.showQuickPick(picks, pickOptions);
        if (pick && pick.label === customLabel && !!customQuestion) {
            const next = yield ask(customQuestion || '', input => {
                save({ label: input, description: '' });
                return true;
            });
            return next;
        }
        if (pick === undefined) {
            return false;
        }
        save(pick);
        return true;
    });
}
function ask(question, save, validate) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            placeHolder: question,
            ignoreFocusOut: true
        };
        if (validate) {
            options.validateInput = validate;
        }
        const input = yield vscode.window.showInputBox(options);
        if (input === undefined) {
            return false;
        }
        save(input);
        return true;
    });
}
const DEFAULT_TYPES = [
    {
        value: 'feat',
        name: 'A new feature'
    },
    {
        value: 'fix',
        name: 'A bug fix'
    },
    {
        value: 'docs',
        name: 'Documentation only changes'
    },
    {
        value: 'style',
        name: 'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)'
    },
    {
        value: 'refactor',
        name: 'A code change that neither fixes a bug nor adds a feature'
    },
    {
        value: 'perf',
        name: 'A code change that improves performance'
    },
    {
        value: 'test',
        name: 'Adding missing tests or correcting existing tests'
    },
    {
        value: 'build',
        name: 'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)'
    },
    {
        value: 'ci',
        name: 'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)'
    },
    {
        value: 'chore',
        name: 'Other changes that don\'t modify src or test files'
    }
];
const DEFAULT_MESSAGES = {
    type: 'Select the type of change that you\'re committing',
    customScope: 'Denote the SCOPE of this change',
    customScopeEntry: 'Custom scope...',
    scope: 'Denote the SCOPE of this change (optional)',
    subject: 'Write a SHORT, IMPERATIVE tense description of the change',
    body: 'Provide a LONGER description of the change (optional). Use "|" to break new line',
    breaking: 'List any BREAKING CHANGES (optional)',
    footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34'
};
function commit(cwd, message) {
    return __awaiter(this, void 0, void 0, function* () {
        channel.appendLine(`About to commit '${message}'`);
        try {
            yield conditionallyStageFiles(cwd);
            const result = yield execa('git', ['commit', '-m', message], { cwd });
            yield vscode.commands.executeCommand('git.refresh');
            if (getConfiguration().autoSync) {
                yield vscode.commands.executeCommand('git.sync');
            }
            if (hasOutput(result)) {
                result.stdout.split('\n').forEach(line => channel.appendLine(line));
                if (shouldShowOutput(result)) {
                    channel.show();
                }
            }
        }
        catch (e) {
            vscode.window.showErrorMessage(e.message);
            channel.appendLine(e.message);
            channel.appendLine(e.stack);
        }
    });
}
function hasOutput(result) {
    return Boolean(result && result.stdout);
}
function shouldShowOutput(result) {
    return getConfiguration().showOutputChannel === 'always'
        || getConfiguration().showOutputChannel === 'onError' && result.code > 0;
}
function conditionallyStageFiles(cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        const hasSmartCommitEnabled = vscode.workspace.getConfiguration('git')
            .get('enableSmartCommit') === true;
        if (hasSmartCommitEnabled && !(yield hasStagedFiles(cwd))) {
            channel.appendLine('Staging all files (enableSmartCommit enabled with nothing staged)');
            yield vscode.commands.executeCommand('git.stageAll');
        }
    });
}
function hasStagedFiles(cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield execa('git', ['diff', '--name-only', '--cached'], { cwd });
        return hasOutput(result);
    });
}
class ConventionalCommitMessage {
    constructor(czConfig) {
        this.next = true;
        this.czConfig = czConfig;
    }
    static hasScopes(czConfig) {
        return Boolean(czConfig && czConfig.scopes && czConfig.scopes.length !== 0);
    }
    static hasCustomMessage(czConfig, messageType) {
        return Boolean(czConfig && czConfig.messages && czConfig.messages.hasOwnProperty(messageType));
    }
    getType() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.next) {
                const types = (this.czConfig && this.czConfig.types) || DEFAULT_TYPES;
                const typePicks = types.map(type => ({
                    label: type.value,
                    description: type.name
                }));
                this.next = yield askOneOf(this.inputMessage('type'), typePicks, pick => this.type = pick.label);
            }
        });
    }
    getScope() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.next) {
                if (ConventionalCommitMessage.hasScopes(this.czConfig)) {
                    if (this.czConfig.scopes && this.czConfig.scopes[0] !== undefined) {
                        const scopePicks = this.czConfig.scopes.map(scope => ({
                            label: scope.name || scope,
                            description: ''
                        }));
                        if (this.czConfig.allowCustomScopes) {
                            scopePicks.push({
                                label: this.inputMessage('customScopeEntry'),
                                description: ''
                            });
                        }
                        this.next = yield askOneOf(this.inputMessage('customScope'), scopePicks, pick => {
                            this.scope = pick.label || undefined;
                        }, this.inputMessage('customScopeEntry'), this.inputMessage('customScope'));
                    }
                }
                else {
                    this.next = yield ask(this.inputMessage('scope'), input => this.scope = input);
                }
            }
        });
    }
    getSubject() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.next) {
                const maxLenght = getConfiguration().subjectLength;
                const validator = (input) => {
                    if (input.length === 0 || input.length > maxLenght) {
                        return `Subject is required and must be less than ${maxLenght} characters`;
                    }
                    return '';
                };
                this.next = yield ask(this.inputMessage('subject'), input => this.subject = input, validator);
            }
        });
    }
    getBody() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.next) {
                this.next = yield ask(this.inputMessage('body'), input => this.body = wrap(input.split('|').join('\n'), 72, { hard: true }));
            }
        });
    }
    getBreaking() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.next) {
                this.next = yield ask(this.inputMessage('breaking'), input => this.breaking = input);
            }
        });
    }
    getFooter() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.next) {
                this.next = yield ask(this.inputMessage('footer'), input => this.footer = input);
            }
        });
    }
    get complete() {
        return this.next && Boolean(this.type) && Boolean(this.subject);
    }
    get message() {
        // tslint:disable-next-line prefer-template
        return this.type +
            (typeof this.scope === 'string' && this.scope ? `(${this.scope})` : '') +
            `: ${this.subject}\n\n${this.body}\n\n` +
            (this.breaking ? `BREAKING CHANGE: ${this.breaking}\n` : '') +
            this.messageFooter();
    }
    messageFooter() {
        return this.footer
            ? `${this.czConfig && this.czConfig.footerPrefix ? this.czConfig.footerPrefix : 'Closes '}${this.footer}`
            : '';
    }
    inputMessage(messageType) {
        return ConventionalCommitMessage.hasCustomMessage(this.czConfig, messageType)
            ? this.czConfig.messages[messageType]
            : DEFAULT_MESSAGES[messageType];
    }
}
//# sourceMappingURL=extension.js.map