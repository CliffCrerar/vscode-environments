"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const util_1 = require("./util");
const environment_1 = require("./environment");
const Q = require("q");
exports.GenerateQuickPickItems = [
    { label: 'component', description: 'ng g component' },
    { label: 'directive', description: 'ng g directive' },
    { label: 'service', description: 'ng g service' },
    { label: 'class', description: 'ng g class' },
    { label: 'interface', description: 'ng g interface' },
    { label: 'module', description: 'ng g module' },
    { label: 'pipe', description: 'ng g pipe' },
    { label: 'guard', description: 'ng g guard' },
    { label: 'enum', description: 'ng g enum' },
];
class Generate {
    static showPickTypeDialog(args) {
        const deferred = Q.defer();
        vscode_1.window.showQuickPick(exports.GenerateQuickPickItems).then((result) => {
            if (result && result.label) {
                deferred.resolve({ cwd: util_1.getFolderPath(args), type: result.label });
            }
            else {
                vscode_1.window.showWarningMessage('Not picker generate type.');
            }
        });
        return deferred.promise;
    }
    static showFileNameDialog(args) {
        const deferred = Q.defer();
        vscode_1.window.showInputBox({
            prompt: '请输入你要自动生成的文件名称',
            placeHolder: 'Generate name'
        }).then((fileName) => {
            if (!fileName || /[~`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?\s]/g.test(fileName)) {
                deferred.reject('That\'s not a valid name! (no whitespaces or special characters)');
            }
            else {
                args.name = fileName;
                deferred.resolve(args);
            }
        }, (error) => { vscode_1.window.showErrorMessage(error); });
        return deferred.promise;
    }
    static generateComponent(option) {
        const deferred = Q.defer();
        const result = environment_1.Environment.execSync(`ng g ${option.type} ${option.name}`, option.cwd);
        vscode_1.window.showInformationMessage(result);
        return deferred.promise;
    }
}
exports.Generate = Generate;
//# sourceMappingURL=generate.js.map