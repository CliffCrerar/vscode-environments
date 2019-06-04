"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const addpackage_1 = require("./addpackage");
const removepackage_1 = require("./removepackage");
function nugetCommands() {
    let items = [
        {
            label: "Add package",
            description: "Adds a package reference to a project file."
        },
        {
            label: "Remove package",
            description: "Removes a package reference from a project file."
        }
    ];
    let options = { matchOnDescription: false, placeHolder: "select Type" };
    vscode.window.showQuickPick(items, options).then(data => {
        switch (data.label) {
            case "Add package": {
                addpackage_1.addPackage();
                break;
            }
            case "Remove package": {
                removepackage_1.removePackage();
                break;
            }
        }
    });
}
exports.nugetCommands = nugetCommands;
//# sourceMappingURL=_nugetCommands.js.map