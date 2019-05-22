"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decoration_operator_1 = require("./decoration-operator");
const text_decorator_1 = require("./text-decorator");
class DecorationOperatorFactory {
    constructor(decorationRegistry, decorationTypeRegistry, textLocationRegistry, windowComponent) {
        this.decorationRegistry = decorationRegistry;
        this.textDecorator = new text_decorator_1.default(textLocationRegistry, decorationTypeRegistry);
        this.windowComponent = windowComponent;
    }
    createForVisibleEditors() {
        return this.create(this.windowComponent.visibleTextEditors);
    }
    create(editors) {
        return new decoration_operator_1.default(editors, this.decorationRegistry, this.textDecorator);
    }
}
exports.default = DecorationOperatorFactory;
//# sourceMappingURL=decoration-operator-factory.js.map