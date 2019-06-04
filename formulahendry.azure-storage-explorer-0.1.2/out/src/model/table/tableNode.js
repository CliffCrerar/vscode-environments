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
const path = require("path");
const vscode = require("vscode");
class TableNode {
    constructor(table, tableService, tableLabelNode) {
        this.table = table;
        this.tableService = tableService;
        this.tableLabelNode = tableLabelNode;
    }
    getTreeItem() {
        return {
            label: this.table,
            contextValue: "table",
            iconPath: path.join(__filename, "..", "..", "..", "..", "..", "resources", "AzureTable_16x.png"),
        };
    }
    getChildren(azureAccount) {
        return [];
    }
    deleteTable(storageTreeDataProvider) {
        const yes = "Yes";
        const no = "No";
        vscode.window.showInformationMessage(`Are you sure to delete ${this.table}?`, { title: yes }, { title: no, isCloseAffordance: true }).then((selection) => {
            switch (selection && selection.title) {
                case yes:
                    vscode.window.withProgress({
                        title: `Deleting table [${this.table}] ...`,
                        location: vscode.ProgressLocation.Window,
                    }, (progress) => __awaiter(this, void 0, void 0, function* () {
                        yield new Promise((resolve, reject) => {
                            this.tableService.deleteTableIfExists(this.table, (error, response) => {
                                if (error) {
                                    vscode.window.showErrorMessage(error.message);
                                    reject(error.message);
                                }
                                else {
                                    storageTreeDataProvider.refresh(this.tableLabelNode);
                                    resolve();
                                }
                            });
                        });
                    }));
                    break;
                default:
            }
        });
    }
}
exports.TableNode = TableNode;
//# sourceMappingURL=tableNode.js.map