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
const const_1 = require("./const");
class PatternVariationReader {
    constructor(windowComponent) {
        this.windowComponent = windowComponent;
    }
    read(currentPattern) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = this.buildSelectItems(currentPattern);
            const options = { placeHolder: 'Select how to update the highlight' };
            const item = yield this.windowComponent.showQuickPick(items, options);
            if (!item)
                return;
            switch (item.actionId) {
                case const_1.PatternAction.TOGGLE_CASE_SENSITIVITY:
                    return currentPattern.toggleCaseSensitivity();
                case const_1.PatternAction.TOGGLE_WHOLE_MATCH:
                    return currentPattern.toggleWholeMatch();
                case const_1.PatternAction.UPDATE_PHRASE: {
                    const options = {
                        value: currentPattern.phrase,
                        prompt: 'Enter a new pattern.'
                    };
                    const newPhrase = yield this.windowComponent.showInputBox(options);
                    return newPhrase ? currentPattern.updatePhrase(newPhrase) : undefined;
                }
            }
        });
    }
    buildSelectItems(pattern) {
        return [
            this.getToggleCaseSensitivityOption(pattern),
            this.getToggleWholeMatchOption(pattern),
            this.getUpdatePhraseOption(pattern)
        ];
    }
    getToggleCaseSensitivityOption(pattern) {
        const label = pattern.ignoreCase ? 'Case Sensitive' : 'Case Insensitive';
        return {
            label: `Change to ${label}`,
            actionId: const_1.PatternAction.TOGGLE_CASE_SENSITIVITY,
            description: ''
        };
    }
    getToggleWholeMatchOption(pattern) {
        const label = pattern.wholeMatch ? 'Partial Match' : 'Whole Match';
        return {
            label: `Change to ${label}`,
            actionId: const_1.PatternAction.TOGGLE_WHOLE_MATCH,
            description: ''
        };
    }
    getUpdatePhraseOption(pattern) {
        const label = pattern.type === 'RegExp' ? 'RegExp Pattern' : 'Text Pattern';
        return {
            label: `Update ${label}`,
            actionId: const_1.PatternAction.UPDATE_PHRASE,
            description: ''
        };
    }
}
exports.default = PatternVariationReader;
//# sourceMappingURL=pattern-variation-reader.js.map