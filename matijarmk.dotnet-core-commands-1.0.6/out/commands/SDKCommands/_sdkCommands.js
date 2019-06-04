"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const newproject_1 = require("./newproject");
const restore_1 = require("./restore");
const build_1 = require("./build");
const version_1 = require("./version");
const publish_1 = require("./publish");
const run_1 = require("./run");
const clean_1 = require("./clean");
const test_1 = require("./test");
function sdkCommands() {
    let param = ["ef migrations"];
    let items = [
        {
            label: "New",
            description: "Creates a new project, configuration file, or solution based on the specified template."
        },
        {
            label: "Restore",
            description: "Restores the dependencies and tools of a project."
        },
        {
            label: "Run",
            description: "Runs source code without any explicit compile or launch commands."
        },
        {
            label: "Build",
            description: "Builds a project and all of its dependencies."
        },
        {
            label: "Clean",
            description: "Clean build output(s)."
        },
        {
            label: "Test",
            description: "Runs unit tests using the test runner specified in the project."
        },
        {
            label: "Publish",
            description: "Packs the application and its dependencies into a folder for deployment to a hosting."
        },
        {
            label: "Version",
            description: "Displays version."
        }
    ];
    let options = { matchOnDescription: false, placeHolder: "select Type" };
    vscode.window.showQuickPick(items, options).then(data => {
        switch (data.label) {
            case "New": {
                newproject_1.newproject();
                break;
            }
            case "Restore": {
                restore_1.restore();
                break;
            }
            case "Build": {
                build_1.build();
                break;
            }
            case "Clean": {
                clean_1.clean();
                break;
            }
            case "Test": {
                test_1.test();
                break;
            }
            case "Publish": {
                publish_1.publish();
                break;
            }
            case "Run": {
                run_1.run();
                break;
            }
            case "Version": {
                version_1.version();
                break;
            }
        }
    });
}
exports.sdkCommands = sdkCommands;
//# sourceMappingURL=_sdkCommands.js.map