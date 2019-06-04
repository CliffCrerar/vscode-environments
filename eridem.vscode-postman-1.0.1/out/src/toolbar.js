"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Toolbar {
    constructor(_toolbarItem, _config) {
        this._toolbarItem = _toolbarItem;
        this._config = _config;
        this._toolbarItem.text = 'Postman';
    }
    changeText(description) {
        if (this._config.showProgressInToolbar) {
            this._toolbarItem.text = 'Postman - ' + description;
        }
    }
}
exports.Toolbar = Toolbar;
//# sourceMappingURL=toolbar.js.map