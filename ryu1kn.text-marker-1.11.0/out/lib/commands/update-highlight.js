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
class UpdateHighlightCommand {
    constructor(decorationOperatorFactory, decorationRegistry, patternVariationReader, textLocationRegistry) {
        this.decorationOperatorFactory = decorationOperatorFactory;
        this.decorationRegistry = decorationRegistry;
        this.patternVariationReader = patternVariationReader;
        this.textLocationRegistry = textLocationRegistry;
    }
    execute(textEditor) {
        return __awaiter(this, void 0, void 0, function* () {
            const decorationId = this.textLocationRegistry.queryDecorationId(textEditor.id, textEditor.selection).toUndefined();
            if (!decorationId)
                return;
            const decorationOpt = this.decorationRegistry.inquireById(decorationId);
            return decorationOpt.fold(Promise.resolve(Option_1.none), (decoration) => __awaiter(this, void 0, void 0, function* () {
                const newDecorationOpt = yield this.patternVariationReader.read(decoration);
                return newDecorationOpt.map(newDecoration => {
                    const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
                    decorationOperator.updateDecoration(decoration, newDecoration);
                });
            }));
        });
    }
}
exports.default = UpdateHighlightCommand;
//# sourceMappingURL=update-highlight.js.map