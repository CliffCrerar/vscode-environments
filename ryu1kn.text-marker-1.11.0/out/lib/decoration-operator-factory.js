"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decoration_operator_1 = require("./decoration-operator");
const pattern_converter_1 = require("./pattern-converter");
const text_decorator_1 = require("./text-decorator");
class DecorationOperatorFactory {
    constructor(decorationRegistry, textLocationRegistry, windowComponent) {
        this.decorationRegistry = decorationRegistry;
        this.textDecorator = new text_decorator_1.default(textLocationRegistry);
        this.windowComponent = windowComponent;
        this.patternConverter = new pattern_converter_1.default();
    }
    createForVisibleEditors() {
        return this.create(this.windowComponent.visibleTextEditors);
    }
    create(editors) {
        return new decoration_operator_1.default(editors, this.decorationRegistry, this.textDecorator, this.patternConverter);
    }
}
exports.default = DecorationOperatorFactory;
//# sourceMappingURL=decoration-operator-factory.js.map