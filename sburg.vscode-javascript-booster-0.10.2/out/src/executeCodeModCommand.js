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
function executeCodeModCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode_1.window.activeTextEditor) {
            return;
        }
        const document = vscode_1.window.activeTextEditor.document;
        const documentRef = {
            uri: document.uri.toString(),
            version: document.version
        };
        const selection = vscode_1.window.activeTextEditor.selection;
        /* const codeMods = await langService.requestGlobalCodeMods({
            textDocumentUri: document.uri.toString(),
            selection
        });
        const pickResult = await window.showQuickPick(
            codeMods.map(m => ({
                label: m.name,
                description: m.description,
                detail: m.detail,
                modId: m
            }))
        );
        if (!pickResult) {
            return;
        }
    
        const result = await langService.executeTransform(pickResult.modId, documentRef, selection);
        if (!result) {
            return;
        }
    
        await window.activeTextEditor!.edit(edit => {
            edit.replace(
                new Range(
                    new Position(result.range.start.line, result.range.start.character),
                    new Position(result.range.end.line, result.range.end.character)
                ),
                result.newText
            );
        }); */
    });
}
exports.executeCodeModCommand = executeCodeModCommand;
//# sourceMappingURL=executeCodeModCommand.js.map