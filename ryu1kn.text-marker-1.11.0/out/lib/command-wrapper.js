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
const text_editor_1 = require("./text-editor");
class CommandWrapper {
    constructor(command, logger) {
        this.command = command;
        this.logger = logger;
    }
    execute(vsEditor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const editor = vsEditor && new text_editor_1.default(vsEditor);
                return yield this.command.execute(editor);
            }
            catch (e) {
                this.logger.error(e.stack);
            }
        });
    }
}
exports.default = CommandWrapper;
//# sourceMappingURL=command-wrapper.js.map