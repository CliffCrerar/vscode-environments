'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../System/utils");
const TypeElement_1 = require("../System/CSharp/TypeElement");
class InjectDependency {
    tryGetCommand(document, range) {
        var type = TypeElement_1.default.fromCursorPosition(document, range.start);
        if (type) {
            let command = {
                title: InjectDependency.actionTitle,
                command: InjectDependency.actionId,
                arguments: [document, range]
            };
            return command;
        }
        return null;
    }
    executeAction(document, range) {
        var type = TypeElement_1.default.fromCursorPosition(document, range.start);
        if (type && type.constructors) {
            utils_1.utils.SymbolPicker.Pick().then(symbol => {
                type.constructors.addInjectedParameter(symbol.name);
                console.log(symbol);
            });
        }
    }
}
InjectDependency.actionId = 'supersharp.injectDependency';
InjectDependency.actionTitle = "Introduce injected dependency...";
exports.default = InjectDependency;
//# sourceMappingURL=injectDependency.js.map