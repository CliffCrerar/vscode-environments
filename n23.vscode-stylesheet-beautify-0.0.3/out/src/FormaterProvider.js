"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Beautify = require("js-beautify");
class FormaterProvider {
    css(code, options) {
        let beautifyOptions = {};
        Object.assign(beautifyOptions, { indent_size: options.tabSize });
        return Beautify.css(code, beautifyOptions);
    }
}
exports.FormaterProvider = FormaterProvider;
//# sourceMappingURL=FormaterProvider.js.map