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
const pattern_factory_1 = require("./pattern/pattern-factory");
class RegexReader {
    constructor(matchingModeRegistry, windowComponent) {
        this.patternFactory = new pattern_factory_1.default(matchingModeRegistry);
        this.windowComponent = windowComponent;
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = this.getInputBoxOption();
            const phraseOpt = yield this.windowComponent.showInputBox(options);
            return phraseOpt.map(phrase => this.patternFactory.create({
                type: 'RegExp',
                phrase
            }));
        });
    }
    getInputBoxOption() {
        return { placeHolder: 'Enter a regular expression to highlight text' };
    }
}
exports.default = RegexReader;
//# sourceMappingURL=regex-reader.js.map