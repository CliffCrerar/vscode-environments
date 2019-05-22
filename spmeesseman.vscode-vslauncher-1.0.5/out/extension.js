"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
const configuration_1 = require("./common/configuration");
const util_1 = require("./util");
const path = require("path");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const disposables = [];
        context.subscriptions.push(new vscode_1.Disposable(() => vscode_1.Disposable.from(...disposables).dispose()));
        yield _activate(context, disposables).catch(err => console.error(err));
    });
}
exports.activate = activate;
function _activate(context, disposables) {
    return __awaiter(this, void 0, void 0, function* () {
        exports.logOutputChannel = vscode_1.window.createOutputChannel("Visual Studio Launcher");
        disposables.push(exports.logOutputChannel);
        util_1.log('');
        util_1.log('Init extension');
        vscode_1.commands.registerCommand("vsLauncher.showOutput", () => exports.logOutputChannel.show());
        const showOutput = configuration_1.configuration.get("showOutput");
        if (showOutput) {
            exports.logOutputChannel.show();
        }
        var disposable = vscode_1.commands.registerCommand('vsLauncher.openInVS', (fileUri) => {
            let vsPath2017E = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Enterprise\\Common7\\IDE\\devenv.exe';
            let vsPath2017P = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Professional\\Common7\\IDE\\devenv.exe';
            let vsPath2017C = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017\\Community\\Common7\\IDE\\devenv.exe';
            let vsPath2015 = 'C:\\Program Files (x86)\\Microsoft Visual Studio 14.0\\Common7\\IDE\\devenv.exe';
            let vsPath2013 = 'C:\\Program Files (x86)\\Microsoft Visual Studio 12.0\\Common7\\IDE\\devenv.exe';
            let vsPath2012 = 'C:\\Program Files (x86)\\Microsoft Visual Studio 11.0\\Common7\\IDE\\devenv.exe';
            let vsPath2010 = 'C:\\Program Files (x86)\\Microsoft Visual Studio 10.0\\Common7\\IDE\\devenv.exe';
            let vsPath;
            util_1.log('');
            util_1.log('Received openInVS command');
            vsPath = configuration_1.configuration.get("pathToVS");
            if (!vsPath) {
                if (util_1.pathExists(vsPath2017E)) {
                    vsPath = vsPath2017E;
                }
                else if (util_1.pathExists(vsPath2017C)) {
                    vsPath = vsPath2017C;
                }
                else if (util_1.pathExists(vsPath2017P)) {
                    vsPath = vsPath2017P;
                }
                else if (util_1.pathExists(vsPath2015)) {
                    vsPath = vsPath2015;
                }
                else if (util_1.pathExists(vsPath2013)) {
                    vsPath = vsPath2013;
                }
                else if (util_1.pathExists(vsPath2012)) {
                    vsPath = vsPath2012;
                }
                else if (util_1.pathExists(vsPath2010)) {
                    vsPath = vsPath2010;
                }
            }
            if (!vsPath) {
                vscode_1.window.showErrorMessage('Visual Studio not found');
                return;
            }
            util_1.log('   found visual studio');
            util_1.logValue('      path', vsPath);
            if (!fileUri) {
                util_1.log('   fileUri empty, editor check');
                var editor = vscode_1.window.activeTextEditor;
                if (!editor) {
                    vscode_1.window.showErrorMessage('Could not find and valid text editor. Please open a file in Code first.');
                    return; // No open text editor
                }
                if (editor.document.isUntitled) {
                    vscode_1.window.showErrorMessage('Please save the file first.');
                    return; // No open text editor
                }
                fileUri = editor.document.uri;
            }
            util_1.logValue('   current file to open', path.basename(fileUri.fsPath));
            let args = [];
            let isProj = path.extname(fileUri.fsPath) === '.csproj' ||
                path.extname(fileUri.fsPath) === '.vcproj' ||
                path.extname(fileUri.fsPath) === '.vbproj' ||
                path.extname(fileUri.fsPath) === '.vdproj' ||
                path.extname(fileUri.fsPath) === '.sln';
            if (isProj) {
                util_1.log('      VS project/solution detected');
            }
            else {
                args.push('/edit');
            }
            args.push(fileUri.fsPath);
            util_1.log('   launching visual studio...');
            /*
            let options = {
                "cwd": path.dirname(fileUri.fsPath)
            };
    
            let execution = new ProcessExecution(vsPath, args, options);
            let kind: TaskDefinition = {
                type: 'vsstudio'
            };
            tasks.executeTask(new Task(kind, workspace.getWorkspaceFolder(fileUri), 'launch', 'vsstudio', execution));
            */
            const execFile = require('child_process').execFile;
            execFile(vsPath, args, (error, stdout, stderr) => {
                util_1.log(`   stdout: ${stdout}`);
                util_1.log(`   stderr: ${stderr}`);
                if (error !== null) {
                    util_1.log('   error launching Visual Studio');
                    console.log(error);
                }
            });
            // Display a message box to the user
            util_1.log('   file opened');
        });
        context.subscriptions.push(disposable);
    });
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map