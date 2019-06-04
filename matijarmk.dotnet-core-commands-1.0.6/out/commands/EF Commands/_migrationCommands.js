"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const add_1 = require("./add");
const list_1 = require("./list");
const remove_1 = require("./remove");
const script_1 = require("./script");
const update_1 = require("./update");
const dbcontextlist_1 = require("./dbcontextlist");
const dbcontexinfo_1 = require("./dbcontexinfo");
function migrationCommands() {
    let param = ["ef migrations"];
    let items = [
        {
            label: "Add",
            description: "Adds a new migration."
        },
        {
            label: "Remove",
            description: "Removes the last migration."
        },
        {
            label: "Update",
            description: "Updates the database to a specified migration."
        },
        {
            label: "List",
            description: "Lists available migrations."
        },
        {
            label: "Script",
            description: "Generates a SQL script from migrations."
        },
        {
            label: "Dbcontext list",
            description: "Lists available DbContext types."
        },
        {
            label: "Dbcontext info",
            description: "Gets information about a DbContext type."
        }
    ];
    let options = { matchOnDescription: false, placeHolder: "select Type" };
    vscode.window.showQuickPick(items, options).then(data => {
        switch (data.label) {
            case "Add": {
                add_1.add();
                break;
            }
            case "Remove": {
                remove_1.remove();
                break;
            }
            case "Update": {
                update_1.update();
                break;
            }
            case "List": {
                list_1.list();
                break;
            }
            case "Script": {
                script_1.script();
                break;
            }
            case "Dbcontext list": {
                dbcontextlist_1.dbcontextList();
                break;
            }
            case "Dbcontext info": {
                dbcontexinfo_1.dbcontextInfo();
                break;
            }
        }
    });
}
exports.migrationCommands = migrationCommands;
//# sourceMappingURL=_migrationCommands.js.map