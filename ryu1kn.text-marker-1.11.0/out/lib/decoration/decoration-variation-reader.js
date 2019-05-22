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
const Option_1 = require("fp-ts/lib/Option");
const telemetry_reporter_locator_1 = require("../telemetry/telemetry-reporter-locator");
var DecorationAction;
(function (DecorationAction) {
    DecorationAction["TOGGLE_CASE_SENSITIVITY"] = "toggle-case-sensitivity";
    DecorationAction["TOGGLE_WHOLE_MATCH"] = "toggle-whole-match";
    DecorationAction["UPDATE_PHRASE"] = "update-phrase";
    DecorationAction["UPDATE_COLOUR"] = "update-colour";
})(DecorationAction || (DecorationAction = {}));
class DecorationVariationReader {
    constructor(windowComponent) {
        this.windowComponent = windowComponent;
        this.telemetryReporter = telemetry_reporter_locator_1.TelemetryReporterLocator.getReporter();
    }
    read(currentDecoration) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = this.buildSelectItems(currentDecoration);
            const options = { placeHolder: 'Select how to update the highlight' };
            const item = yield this.windowComponent.showQuickPick(items, options);
            return item.fold(Promise.resolve(Option_1.none), it => this.createDecoration(currentDecoration, it));
        });
    }
    createDecoration(currentDecoration, item) {
        return __awaiter(this, void 0, void 0, function* () {
            this.telemetryReporter.logHighlightUpdated(item.actionId);
            switch (item.actionId) {
                case DecorationAction.TOGGLE_CASE_SENSITIVITY:
                    return Option_1.some(currentDecoration.withCaseSensitivityToggled());
                case DecorationAction.TOGGLE_WHOLE_MATCH:
                    return Option_1.some(currentDecoration.withWholeMatchToggled());
                case DecorationAction.UPDATE_PHRASE: {
                    const options = {
                        value: currentDecoration.pattern.phrase,
                        prompt: 'Enter a new pattern.'
                    };
                    const newPhraseOpt = yield this.windowComponent.showInputBox(options);
                    return newPhraseOpt.map(newPhrase => currentDecoration.withPhrase(newPhrase));
                }
                case DecorationAction.UPDATE_COLOUR: {
                    const options = {
                        value: currentDecoration.colour,
                        prompt: 'Enter a new color.'
                    };
                    const newPhraseOpt = yield this.windowComponent.showInputBox(options);
                    return newPhraseOpt.map(newColour => currentDecoration.withColour(newColour));
                }
            }
        });
    }
    buildSelectItems(decoration) {
        return [
            this.getToggleCaseSensitivityOption(decoration),
            this.getToggleWholeMatchOption(decoration),
            this.getUpdatePhraseOption(decoration),
            this.getUpdateColourOption(decoration)
        ];
    }
    getToggleCaseSensitivityOption(decoration) {
        const label = decoration.pattern.ignoreCase ? 'Case Sensitive' : 'Case Insensitive';
        return {
            label: `Change to ${label}`,
            actionId: DecorationAction.TOGGLE_CASE_SENSITIVITY
        };
    }
    getToggleWholeMatchOption(decoration) {
        const label = decoration.pattern.wholeMatch ? 'Partial Match' : 'Whole Match';
        return {
            label: `Change to ${label}`,
            actionId: DecorationAction.TOGGLE_WHOLE_MATCH
        };
    }
    getUpdatePhraseOption(decoration) {
        const label = decoration.pattern.type === 'RegExp' ? 'RegExp Pattern' : 'Text Pattern';
        return {
            label: `Update ${label}`,
            actionId: DecorationAction.UPDATE_PHRASE
        };
    }
    getUpdateColourOption(decoration) {
        return {
            label: 'Update Color',
            actionId: DecorationAction.UPDATE_COLOUR
        };
    }
}
exports.default = DecorationVariationReader;
//# sourceMappingURL=decoration-variation-reader.js.map