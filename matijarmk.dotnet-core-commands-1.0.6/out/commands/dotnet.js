"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const _sdkCommands_1 = require("./SDKCommands/_sdkCommands");
const _efCommands_1 = require("./EFCommands/_efCommands");
const _nugetCommands_1 = require("./NuGetCommands/_nugetCommands");
exports.dotnet = vscode.commands.registerCommand("extension.Dotnet", () => {
    let param;
    let items = ["SDK commands", "EF commands", "NuGet Packages"];
    let options = { matchOnDescription: false, placeHolder: "select Type" };
    vscode.window.showQuickPick(items, options).then(data => {
        switch (data) {
            case "SDK commands": {
                _sdkCommands_1.sdkCommands();
                break;
            }
            case "EF commands": {
                _efCommands_1.efCommands();
                break;
            }
            case "NuGet Packages": {
                _nugetCommands_1.nugetCommands();
                break;
            }
        }
    });
});
//# sourceMappingURL=dotnet.js.map