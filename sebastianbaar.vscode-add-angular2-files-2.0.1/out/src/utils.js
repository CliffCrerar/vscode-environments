"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class Utils {
    static getStylesheetConfig() {
        var addAngularConfigStylesheet = vscode_1.workspace.getConfiguration('addAngular')['stylesheet'];
        var stylesheetFileExtension = 'css';
        switch (addAngularConfigStylesheet) {
            case 'css':
                break;
            case 'sass':
                stylesheetFileExtension = 'scss';
                break;
            case 'less':
                stylesheetFileExtension = 'less';
                break;
            default:
                stylesheetFileExtension = 'css';
        }
        return stylesheetFileExtension;
    }
    static getAddTestFileConfig() {
        return vscode_1.workspace.getConfiguration('addAngular')['addTestFile'];
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map