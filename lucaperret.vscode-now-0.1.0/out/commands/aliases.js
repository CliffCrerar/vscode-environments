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
const vscode = require("vscode");
const aliases_1 = require("../utils/aliases");
function deleteAlias(aliasNode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (aliasNode) {
            try {
                yield aliases_1.deleteAlias(aliasNode.data.uid);
                vscode.window.showInformationMessage('Alias successfuly deleted');
            }
            catch (error) {
                vscode.window.showErrorMessage('Delete alias error: ' + error.message);
            }
        }
        else {
            vscode.window.showInformationMessage('Right-click on an alias in the explorer to delete it');
        }
    });
}
exports.deleteAlias = deleteAlias;
function open(aliasNode) {
    if (aliasNode) {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://' + aliasNode.data.alias));
    }
    else {
        vscode.window.showInformationMessage('Right-click on an alias in the explorer to open the application');
    }
}
exports.open = open;
//# sourceMappingURL=aliases.js.map