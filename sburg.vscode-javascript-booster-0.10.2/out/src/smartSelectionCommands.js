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
const const_1 = require("./const");
const langService_1 = require("./services/langService");
function executeFallbackSelectionCommand(extend) {
    const config = vscode_1.workspace.getConfiguration(const_1.extensionId);
    if (extend) {
        const commandId = config.get(const_1.configIds.smartExtendFallbackCommand);
        vscode_1.commands.executeCommand(commandId);
    }
    else {
        const commandId = config.get(const_1.configIds.smartShrinkFallbackCommand);
        vscode_1.commands.executeCommand(commandId);
    }
}
function extendSelectionCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode_1.window.activeTextEditor) {
            return;
        }
        const document = vscode_1.window.activeTextEditor.document;
        if (!const_1.isSupportedLanguage(document.languageId)) {
            executeFallbackSelectionCommand(true);
            return;
        }
        const newSelections = yield langService_1.default.extendSelection(document.uri.toString(), vscode_1.window.activeTextEditor.selections);
        if (!newSelections) {
            executeFallbackSelectionCommand(true);
            return;
        }
        vscode_1.window.activeTextEditor.selections = newSelections.map(sel => new vscode_1.Selection(new vscode_1.Position(sel.anchor.line, sel.anchor.character), new vscode_1.Position(sel.active.line, sel.active.character)));
    });
}
exports.extendSelectionCommand = extendSelectionCommand;
function shrinkSelectionCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode_1.window.activeTextEditor) {
            return;
        }
        const document = vscode_1.window.activeTextEditor.document;
        if (!const_1.isSupportedLanguage(document.languageId)) {
            executeFallbackSelectionCommand(false);
            return;
        }
        const newSelections = yield langService_1.default.shrinkSelection(document.uri.toString(), vscode_1.window.activeTextEditor.selections);
        if (!newSelections) {
            executeFallbackSelectionCommand(false);
            return;
        }
        vscode_1.window.activeTextEditor.selections = newSelections.map(sel => new vscode_1.Selection(new vscode_1.Position(sel.anchor.line, sel.anchor.character), new vscode_1.Position(sel.active.line, sel.active.character)));
    });
}
exports.shrinkSelectionCommand = shrinkSelectionCommand;
//# sourceMappingURL=smartSelectionCommands.js.map