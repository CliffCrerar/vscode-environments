'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const node_modules_viewer_1 = require("./node-modules-viewer");
function activate(context) {
    const rootPath = vscode.workspace.rootPath;
    const config = vscode.workspace.getConfiguration('node-modules-viewer');
    const nodeDependenciesProvider = new node_modules_viewer_1.DepNodeProvider(rootPath);
    vscode.window.registerTreeDataProvider('node-modules-viewer', nodeDependenciesProvider);
    vscode.commands.registerCommand('node-modules-viewer.refreshEntry', () => nodeDependenciesProvider.refresh());
    vscode.commands.registerCommand('node-modules-viewer.openPackageOnNpm', moduleName => nodeDependenciesProvider.openOnNPM(moduleName.label || moduleName));
    vscode.commands.registerCommand('node-modules-viewer.openFileInEditor', Uri => nodeDependenciesProvider.openFileInEditor(Uri));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map