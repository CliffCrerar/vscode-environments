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
const vscode = require("vscode");
const config_1 = require("./config");
class StatusBarItem {
    constructor(context, dataSource) {
        this.dataSource = dataSource;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this.statusBarItem.text = 'Git Graph';
        this.statusBarItem.tooltip = 'View Git Graph';
        this.statusBarItem.command = 'git-graph.view';
        context.subscriptions.push(this.statusBarItem);
        context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => __awaiter(this, void 0, void 0, function* () {
            this.refresh();
        })));
        this.refresh();
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            if (config_1.getConfig().showStatusBarItem() && (yield this.dataSource.getRepos()).length > 0) {
                this.statusBarItem.show();
            }
            else {
                this.statusBarItem.hide();
            }
        });
    }
}
exports.StatusBarItem = StatusBarItem;
//# sourceMappingURL=statusBarItem.js.map