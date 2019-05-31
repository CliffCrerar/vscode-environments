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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const vscode_1 = require("vscode");
const axios_1 = require("axios");
const AzureGitApp_1 = require("./AzureGitApp");
const AzureGitOptions_1 = require("./AzureGitOptions");
const SETUPMESSAGE = `$(gift) Setup Azure Git`;
const DOWNLOADMESSAGE = `$(gift) Download Repo`;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    var myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.command = 'extension.azuregit.downloadRepo';
    var options = context.globalState.get('options');
    if (options)
        myStatusBarItem.text = DOWNLOADMESSAGE;
    else
        myStatusBarItem.text = SETUPMESSAGE;
    myStatusBarItem.show();
    let app = new AzureGitApp_1.AzureGitApp(myStatusBarItem);
    let disposable = vscode.commands.registerCommand('extension.azuregit.downloadRepo', (args) => {
        FindFiles(args, context, app);
    });
    let disposable2 = vscode.commands.registerCommand('extension.azuregit.initialize', (args) => {
        Initialize(args, context, app);
    });
    let disposable3 = vscode.commands.registerCommand('extension.azuregit.logout', (args) => {
        context.globalState.update('options', null);
        app.statusBar.text = SETUPMESSAGE;
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
    context.subscriptions.push(myStatusBarItem);
}
exports.activate = activate;
function Initialize(args, context, app) {
    return __awaiter(this, void 0, void 0, function* () {
        var org = yield vscode.window.showInputBox({
            placeHolder: 'Enter ORG',
            prompt: "Enter your Organization Name - https://dev.azure.com/[ORG]"
        });
        if (!org)
            return;
        var pat = yield vscode.window.showInputBox({
            placeHolder: 'Enter PAT',
            prompt: "Enter Azure DevOps Personal Access Token with access to Code"
        });
        if (!pat)
            return;
        if (org != undefined && pat != undefined && org != '' && pat != '') {
            let options = new AzureGitOptions_1.AzureGitOptions();
            options.ORG = org;
            options.PAT = pat;
            context.globalState.update('options', options);
            app.statusBar.text = DOWNLOADMESSAGE;
        }
    });
}
function FindFiles(args, context, app) {
    return __awaiter(this, void 0, void 0, function* () {
        var options = context.globalState.get('options');
        if (options) {
            console.log(options);
            let pat_converted = new Buffer(':' + options.PAT, 'binary').toString('base64');
            let projects;
            try {
                projects = yield axios_1.default.get('https://dev.azure.com/' + options.ORG + '/_apis/projects', {
                    headers: { "Authorization": "Basic " + pat_converted }
                });
            }
            catch (error) {
                vscode.window.showWarningMessage('Error Connecting -> Try command Azure Git Repos -> Initialize');
                return;
            }
            if (projects.status != 200) {
                vscode.window.showWarningMessage('Error Connecting -> Try command Azure Git Repos -> Initialize');
                return;
            }
            let allProjects = [];
            projects.data.value.forEach((item) => {
                allProjects.push({
                    label: item.name,
                    description: item.url
                });
            });
            allProjects.sort(function (a, b) {
                return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
            });
            var selectedProject = yield vscode.window.showQuickPick(allProjects);
            if (selectedProject) {
                projects.data.value.forEach((item) => {
                    if (item.name == selectedProject.label)
                        selectedProject = item.id;
                });
            }
            else
                return;
            let data = yield axios_1.default.get('https://dev.azure.com/' + options.ORG + '/' + selectedProject + '/_apis/git/repositories?api-version=5.0', {
                headers: { "Authorization": "Basic " + pat_converted }
            });
            console.log(data);
            let repos = [];
            data.data.value.forEach((item) => {
                repos.push({
                    label: item.name,
                    description: item.remoteUrl
                });
            });
            repos.sort(function (a, b) {
                return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
            });
            var selected = yield vscode.window.showQuickPick(repos);
            if (selected) {
                app.refreshSettings();
                var terminal = vscode.window.createTerminal();
                terminal.show();
                terminal.sendText(app.command1);
                terminal.sendText(app.command2 + ' ' + selected.description);
                terminal.sendText(app.command3);
            }
        }
        else {
            vscode_1.commands.executeCommand('extension.azuregit.initialize');
        }
    });
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map