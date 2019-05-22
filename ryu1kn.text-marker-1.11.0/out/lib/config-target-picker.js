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
const ConfigurationTarget = {
    GLOBAL: true,
    WORKSPACE: false
};
class ConfigurationTargetPicker {
    constructor(windowComponent) {
        this.windowComponent = windowComponent;
    }
    pick() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectItems = this.buildQuickPickItems();
            const options = { placeHolder: 'Select which scope of settings to save highlights to' };
            const item = yield this.windowComponent.showQuickPick(selectItems, options);
            return item.map(it => it.value);
        });
    }
    buildQuickPickItems() {
        return [
            {
                label: 'Global',
                value: ConfigurationTarget.GLOBAL
            },
            {
                label: 'Workspace',
                value: ConfigurationTarget.WORKSPACE
            }
        ];
    }
}
exports.default = ConfigurationTargetPicker;
//# sourceMappingURL=config-target-picker.js.map