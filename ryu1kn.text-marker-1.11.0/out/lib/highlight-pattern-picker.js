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
class HighlightPatternPicker {
    constructor(decorationRegistry, windowComponent) {
        this.decorationRegistry = decorationRegistry;
        this.windowComponent = windowComponent;
    }
    pick(placeHolderText) {
        const decorations = this.decorationRegistry.retrieveAll();
        return decorations.length > 0 ?
            this.showPicker(decorations, placeHolderText) :
            this.showNoItemMessage();
    }
    showPicker(decorations, placeHolderText) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectItems = this.buildQuickPickItems(decorations);
            const options = { placeHolder: placeHolderText };
            const item = yield this.windowComponent.showQuickPick(selectItems, options);
            return item ? item.id : null;
        });
    }
    buildQuickPickItems(decorations) {
        return decorations.map(decoration => ({
            id: decoration.id,
            label: decoration.pattern.displayText,
            detail: this.buildDetail(decoration.pattern),
            description: ''
        }));
    }
    buildDetail(pattern) {
        const caseSuffix = !pattern.ignoreCase ? ' [Aa]' : '';
        const wholeMatchSuffix = pattern.wholeMatch ? ' [Ab|]' : '';
        return `${pattern.type}${caseSuffix}${wholeMatchSuffix}`;
    }
    showNoItemMessage() {
        return this.windowComponent.showInformationMessage('No highlight is registered yet');
    }
}
exports.default = HighlightPatternPicker;
//# sourceMappingURL=highlight-pattern-picker.js.map