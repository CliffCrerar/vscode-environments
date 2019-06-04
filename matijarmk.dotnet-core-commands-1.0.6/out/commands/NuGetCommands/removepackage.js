"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const executeCommand_1 = require("../../executeCommand");
const extension_1 = require("./../../extension");
const xmljs = require("xml-js");
const fs = require("file-system");
var items = [];
function removePackage() {
    extension_1.outputChannel.clear();
    extension_1.outputChannel.show();
    vscode.workspace.findFiles("*.{csproj}").then(files => {
        var packages = {};
        var data = JSON.parse(xmljs.xml2json(fs.readFileSync(files[0].fsPath), {
            compact: true
        })).Project.ItemGroup;
        data.forEach(element => {
            if (element.PackageReference) {
                element.PackageReference.forEach(packageReference => {
                    items.push({
                        label: packageReference._attributes.Include,
                        detail: packageReference._attributes.Version
                    });
                });
            }
        });
        vscode.window
            .showQuickPick(items, { placeHolder: "Select package to remove." })
            .then(fulfilled => {
            if (fulfilled.label != undefined) {
                executeCommand_1.executeCommandInOutputChannel(["remove package", fulfilled.label], true, false);
            }
        });
    });
}
exports.removePackage = removePackage;
//# sourceMappingURL=removepackage.js.map