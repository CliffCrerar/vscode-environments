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
const executeCommand_1 = require("../../executeCommand");
const WebRequest = require("web-request");
var items = [];
function addPackage() {
    showInputBox();
}
exports.addPackage = addPackage;
function showInputBox(value = "") {
    vscode.window
        .showInputBox({
        placeHolder: "Search NuGet package.",
        value: value
    })
        .then(value => {
        if (value !== undefined) {
            getPackageByName(value, 15).then(() => {
                vscode.window
                    .showQuickPick(items, { placeHolder: "Select NuGet package." })
                    .then(fulfilled => {
                    if (fulfilled === undefined) {
                        showInputBox(value);
                    }
                    else {
                        executeCommand_1.executeCommandInOutputChannel(["add package", fulfilled.label], true, false);
                    }
                });
            });
        }
    });
}
function getPackageByName(name, take) {
    return __awaiter(this, void 0, void 0, function* () {
        var result = yield WebRequest.get(`https://api-v2v3search-0.nuget.org/query?q=${name}&prerelease=false&take=${take}`);
        var data = JSON.parse(result.content).data;
        items = [];
        data.forEach(element => {
            items.push({
                label: element.id,
                description: element.description,
                detail: element.version
            });
        });
    });
}
//# sourceMappingURL=addpackage.js.map