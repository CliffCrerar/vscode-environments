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
/**
 * Shows a pick list using window.showQuickPick().
 */
function showQuickPickChoice(choices, placeHolder) {
    return __awaiter(this, void 0, void 0, function* () {
        // extract labels from choices
        var labels = choices.map(choice => ({ label: choice.label }));
        // show quickPick and get result
        var result = yield vscode_1.window.showQuickPick(labels, {
            placeHolder: placeHolder
        });
        // extract 'value' from 'label' result
        if (result) {
            var filteredChoices = choices.filter(choice => choice.label === result.label);
            if (filteredChoices && filteredChoices.length > 0) {
                return filteredChoices[0];
            }
        }
        return null;
    });
}
exports.showQuickPickChoice = showQuickPickChoice;
//# sourceMappingURL=multiStepQuickPick.js.map