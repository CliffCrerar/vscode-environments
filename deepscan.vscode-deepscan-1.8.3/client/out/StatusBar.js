/* --------------------------------------------------------------------------------------------
 * Copyright (c) S-Core Co., Ltd. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const types_1 = require("./types");
class StatusBar {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
        this.setStatus(types_1.Status.ok);
        this.statusBarItem.text = 'DeepScan';
        this.statusBarItem.command = types_1.CommandIds.showOutput;
    }
    getStatusBarItem() {
        return this.statusBarItem;
    }
    getStatus() {
        return this.status;
    }
    setStatus(status) {
        this.status = status;
    }
    getTooltip() {
        return this.statusBarItem.tooltip;
    }
    setTooltip(text) {
        this.statusBarItem.tooltip = text;
    }
    setColor(color) {
        this.statusBarItem.color = color;
    }
    show(show) {
        show ? this.statusBarItem.show() : this.statusBarItem.hide();
    }
    update(status) {
        let tooltip = this.getTooltip();
        let color = '';
        switch (status) {
            case types_1.Status.ok:
                color = 'lightgreen';
                tooltip = 'Issue-free!';
                break;
            case types_1.Status.warn:
                color = 'yellow';
                tooltip = 'Issue(s) detected!';
                break;
            case types_1.Status.fail:
                color = 'darkred';
                tooltip = 'Inspection failed!';
                break;
        }
        this.setColor(color);
        this.setTooltip(tooltip);
        this.setStatus(status);
    }
}
exports.StatusBar = StatusBar;
//# sourceMappingURL=StatusBar.js.map