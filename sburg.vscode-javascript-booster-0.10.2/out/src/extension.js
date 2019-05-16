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
const vscode_1 = require("vscode");
const CodeModCodeActionProvider_1 = require("./CodeModCodeActionProvider");
const const_1 = require("./const");
const executeCodeActionCommand_1 = require("./executeCodeActionCommand");
const executeCodeModCommand_1 = require("./executeCodeModCommand");
const langService_1 = require("./services/langService");
const smartSelectionCommands_1 = require("./smartSelectionCommands");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        langService_1.default.initialize();
        context.subscriptions.push(langService_1.default.start());
        yield langService_1.default.ready();
        context.subscriptions.push(vscode_1.commands.registerCommand(const_1.commandIds._executeCodeAction, executeCodeActionCommand_1.executeCodeActionCommand), vscode_1.commands.registerCommand(const_1.commandIds.executeCodeMod, executeCodeModCommand_1.executeCodeModCommand), vscode_1.commands.registerCommand(const_1.commandIds.extendSelection, smartSelectionCommands_1.extendSelectionCommand), vscode_1.commands.registerCommand(const_1.commandIds.shrinkSelection, smartSelectionCommands_1.shrinkSelectionCommand), vscode_1.languages.registerCodeActionsProvider(const_1.supportedLanguages, new CodeModCodeActionProvider_1.CodeModCodeActionProvider()));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map