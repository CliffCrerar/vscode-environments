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
const vscode_1 = require("vscode");
const primary_options_1 = require("./primary-options");
const secondary_options_1 = require("./secondary-options");
const tertiary_options_1 = require("./tertiary-options");
const multiStepQuickPick_1 = require("./multiStepQuickPick");
const output_1 = require("./output");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "dotnet explorer" is now active!');
    context.subscriptions.push(vscode_1.commands.registerCommand('dotnetexplorer.search', () => __awaiter(this, void 0, void 0, function* () {
        var firstOption = yield multiStepQuickPick_1.showQuickPickChoice(primary_options_1.primaryOptions, `I want to:`);
        if (firstOption.usage) {
            output_1.showUsage(context, firstOption, new Array(firstOption.label));
        }
        else {
            var secondaryChoices = secondary_options_1.secondaryOptions[firstOption.value];
            var secondaryOption = yield multiStepQuickPick_1.showQuickPickChoice(secondaryChoices, `${firstOption.label}:`);
            if (secondaryOption.usage) {
                output_1.showUsage(context, secondaryOption, new Array(firstOption.label, secondaryOption.label));
            }
            else {
                var tertiaryChoices = tertiary_options_1.tertiaryOptions[secondaryOption.value];
                var tertiaryOption = yield multiStepQuickPick_1.showQuickPickChoice(tertiaryChoices, `${firstOption.label} ${secondaryOption.label}:`);
                if (tertiaryOption.usage) {
                    output_1.showUsage(context, tertiaryOption, new Array(firstOption.label, secondaryOption.label, tertiaryOption.label));
                }
            }
        }
    })));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map