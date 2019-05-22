'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const symbolSearchInputOptions_1 = require("./symbolSearchInputOptions");
const symbolInformationQuickPickItem_1 = require("./symbolInformationQuickPickItem");
var utils;
(function (utils) {
    class Regex {
        static countOccurances(of, inString) {
            var match = inString.match(new RegExp(of, "g"));
            if (match == null)
                return 0;
            return match.length;
        }
    }
    utils.Regex = Regex;
    class BalancedCounter {
        constructor() {
            this.started = false;
            this.balance = 0;
        }
        up(amount) {
            if (amount > 0) {
                this.started = true;
                this.balance += amount;
            }
        }
        down(amount) {
            if (amount > 0) {
                this.started = true;
                this.balance -= amount;
            }
        }
        isBalanced() {
            return this.started && this.balance == 0;
        }
    }
    utils.BalancedCounter = BalancedCounter;
    class SymbolPicker {
        static Pick() {
            var promise = new Promise((resolve, reject) => {
                var options = new symbolSearchInputOptions_1.default();
                options.prompt = "Serch for the type you would like to import";
                options.placeHolder = "e.g. service";
                vscode_1.window.showInputBox(options).then(value => {
                    vscode_1.commands.executeCommand('vscode.executeWorkspaceSymbolProvider', value).then((symbols) => {
                        symbols = symbols.filter(s => s.kind == vscode_1.SymbolKind.Class || s.kind == vscode_1.SymbolKind.Interface || s.kind == vscode_1.SymbolKind.Struct);
                        var pickItems = symbols.map(e => new symbolInformationQuickPickItem_1.default(e));
                        vscode_1.window.showQuickPick(pickItems).then(selected => {
                            resolve(selected.symbol);
                        });
                    });
                });
            });
            return promise;
        }
    }
    utils.SymbolPicker = SymbolPicker;
})(utils = exports.utils || (exports.utils = {}));
//# sourceMappingURL=utils.js.map