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
const regex_reader_1 = require("../regex-reader");
class HighlightUsingRegexCommand {
    constructor(decorationOperatorFactory, matchingModeRegistry, windowComponent) {
        this.decorationOperatorFactory = decorationOperatorFactory;
        this.regexReader = new regex_reader_1.default(matchingModeRegistry, windowComponent);
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const regexOpt = yield this.regexReader.read();
            return regexOpt.map(regex => {
                const decorationOperator = this.decorationOperatorFactory.createForVisibleEditors();
                decorationOperator.addDecoration(regex);
            });
        });
    }
}
exports.default = HighlightUsingRegexCommand;
//# sourceMappingURL=highlight-using-regex.js.map