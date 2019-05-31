'use strict';
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
const view_1 = require("./schematics/view");
const commands_1 = require("./schematics/commands");
const output_1 = require("./schematics/output");
const angular_config_1 = require("./schematics/angular-config");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.commands.executeCommand('setContext', 'inAngularProject', true);
        vscode.window.registerTreeDataProvider('angular-schematics', new view_1.AngularSchematicsProvider());
        // The command has been defined in the package.json file
        // Now provide the implementation of the command with  registerCommand
        // The commandId parameter must match the command field in package.json
        const generateComponentCommand = vscode.commands.registerCommand('ngschematics.generateComponent', (context) => __awaiter(this, void 0, void 0, function* () {
            yield commands_1.Commands.generate(context, {
                collectionName: angular_config_1.AngularConfig.cliCollection,
                schemaName: 'component'
            });
        }));
        const generateServiceCommand = vscode.commands.registerCommand('ngschematics.generateService', (context) => __awaiter(this, void 0, void 0, function* () {
            yield commands_1.Commands.generate(context, {
                collectionName: angular_config_1.AngularConfig.cliCollection,
                schemaName: 'service'
            });
        }));
        const generateModuleCommand = vscode.commands.registerCommand('ngschematics.generateModule', (context) => __awaiter(this, void 0, void 0, function* () {
            yield commands_1.Commands.generate(context, {
                collectionName: angular_config_1.AngularConfig.cliCollection,
                schemaName: 'module'
            });
        }));
        const generateCommand = vscode.commands.registerCommand('ngschematics.generate', (context, options = {}) => __awaiter(this, void 0, void 0, function* () {
            yield commands_1.Commands.generate(context, options);
        }));
        context.subscriptions.push(generateComponentCommand, generateServiceCommand, generateModuleCommand, generateCommand);
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    output_1.Output.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map