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
const azureStorage = require("azure-storage");
const path = require("path");
const vscode = require("vscode");
const infoNode_1 = require("../infoNode");
const tableNode_1 = require("./tableNode");
class TableLabelNode {
    constructor(storageAccount, storageAccountKeys) {
        this.storageAccount = storageAccount;
        this.storageAccountKeys = storageAccountKeys;
    }
    getTreeItem() {
        return {
            label: "[Tables]",
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: "tableLabel",
            iconPath: path.join(__filename, "..", "..", "..", "..", "..", "resources", "AzureTable_16x.png"),
        };
    }
    getChildren() {
        const tableService = azureStorage.createTableService(this.storageAccount.name, this.storageAccountKeys[0].value);
        return new Promise((resolve, reject) => {
            tableService.listTablesSegmented(null, (error, result, response) => {
                if (error) {
                    resolve([new infoNode_1.InfoNode(`Failed to list tables: ${error})`)]);
                }
                const tableNodes = result.entries.map((table) => {
                    return new tableNode_1.TableNode(table, tableService, this);
                });
                resolve(tableNodes);
            });
        });
    }
    createTable(storageTreeDataProvider) {
        const tableService = azureStorage.createTableService(this.storageAccount.name, this.storageAccountKeys[0].value);
        vscode.window.showInputBox({
            prompt: "Enter table name",
        }).then((tableName) => __awaiter(this, void 0, void 0, function* () {
            if (!tableName) {
                return;
            }
            vscode.window.withProgress({
                title: `Creating table [${tableName}] ...`,
                location: vscode.ProgressLocation.Window,
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                yield new Promise((resolve, reject) => {
                    tableService.createTableIfNotExists(tableName, (error, result, response) => {
                        if (error) {
                            vscode.window.showErrorMessage(error.message);
                            reject(error.message);
                        }
                        else {
                            storageTreeDataProvider.refresh(this);
                            resolve();
                        }
                    });
                });
            }));
        }));
    }
}
exports.TableLabelNode = TableLabelNode;
//# sourceMappingURL=tableLabelNode.js.map