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
const langService_1 = require("./services/langService");
function executeCodeActionCommand(modId, textDocument, selection) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode_1.window.activeTextEditor) {
            return;
        }
        const result = yield langService_1.default.executeTransform(modId, textDocument, selection);
        if (!result.edit) {
            return;
        }
        yield vscode_1.window.activeTextEditor.edit(edit => {
            edit.replace(new vscode_1.Range(new vscode_1.Position(result.edit.range.start.line, result.edit.range.start.character), new vscode_1.Position(result.edit.range.end.line, result.edit.range.end.character)), result.edit.newText);
        });
        if (result.selection) {
            vscode_1.window.activeTextEditor.selection = result.selection;
        }
    });
}
exports.executeCodeActionCommand = executeCodeActionCommand;
//# sourceMappingURL=executeCodeActionCommand.js.map