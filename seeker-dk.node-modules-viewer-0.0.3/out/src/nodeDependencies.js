"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
class DepNodeProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    openLink(URL) {
        URL = vscode.Uri.parse(URL);
        vscode.commands.executeCommand('vscode.open', URL);
    }
    openOnNPM(moduleName) {
        let URL = vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`);
        this.openLink(URL);
    }
    openFileInEditor(Uri) {
        try {
            vscode.workspace.openTextDocument(Uri).then(doc => {
                console.log("opened");
                vscode.window.showTextDocument(doc).then(editor => {
                    console.log("show");
                    // editor.show() 
                });
            });
        }
        catch (e) {
            console.error("error", e);
        }
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }
        if (!element) {
            const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
            if (this.pathExists(packageJsonPath)) {
                return Promise.resolve(this.ParsePackageJson(packageJsonPath));
            }
            else {
                vscode.window.showInformationMessage('Workspace has no package.json');
                return Promise.resolve([]);
            }
        }
        if (element.type == 'folder') {
            return new Promise(resolve => {
                // TODO Not sure the right way to handle this error without setting input to type any
                let return_array = [];
                let tmp_array = [];
                fs.readdirSync(element.folderPath).forEach(folderElement => {
                    let elementPath = path.join(element.folderPath, folderElement);
                    if (fs.statSync(elementPath).isDirectory()) {
                        return_array.push(new PackageTreeFolder(elementPath, folderElement));
                    }
                    else {
                        tmp_array.push(new PackageTreeFile(vscode.Uri.file(elementPath)));
                    }
                });
                // console.log(return_array.concat(tmp_array))
                resolve(return_array.concat(tmp_array));
            });
        }
        if (element.type == 'dependency') {
            return new Promise(resolve => {
                // console.log("typeof element ", inspect(element))
                let folderElement;
                folderElement = [new PackageTreeFolder(path.join(this.workspaceRoot, 'node_modules', element.label), "Browse module folder")];
                resolve(folderElement.concat(this.ParsePackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json'))));
            });
        }
        vscode.window.showInformationMessage('This should not happen, something wrong with ', util_1.inspect(element));
        Promise.resolve([]);
    }
    /**
     * Given the path to package.json, read all its dependencies and devDependencies.
     */
    ParsePackageJson(packageJsonPath) {
        if (this.pathExists(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const toDep = (moduleName, version) => {
                const folderPath = path.join(this.workspaceRoot, 'node_modules', moduleName);
                if (this.pathExists(folderPath)) {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
                }
                else {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None);
                }
            };
            // const folder path.join(this.workspaceRoot, 'node_modules', element.label
            const dep = packageJson.dependencies ?
                Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep])) : [new Seperator('--- No Dependencies ---')];
            const devdep = packageJson.devDependencies ? [new Seperator('--- Dev Dependencies ---')].concat(Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))) : [new Seperator('--- No Dev Dependencies ---')];
            return [].concat(dep).concat(devdep);
        }
        else {
            return [];
        }
    }
    returnFolderContent(path) {
        if (this.pathExists(path)) {
            const files = fs.readdirSync(path).map(file => {
                // new PackageTreeElem()
            });
        }
        else {
            return [];
        }
    }
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
}
exports.DepNodeProvider = DepNodeProvider;
class DependencyTreeItem extends vscode.TreeItem {
    constructor(label, //TODO better handling of type, to support both string for label and Uri for file (string|vscode.Uri) doesn't work
    collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.type = "unassigned";
    }
    get tooltip() {
        return `This Super should not be shown`;
    }
    get contextValue() {
        return this.type;
    }
    set contextValue(value) {
        this.type = value;
    }
}
class PackageTreeFolder extends DependencyTreeItem {
    constructor(folderPath, label) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.folderPath = folderPath;
        this.label = label;
        this.type = "folder";
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'folder.svg'),
            dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'folder.svg')
        };
    }
    get tooltip() {
        return `${this.folderPath}`;
    }
}
class PackageTreeFile extends vscode.TreeItem {
    constructor(resourceUri) {
        super(resourceUri);
        this.resourceUri = resourceUri;
        this.type = "file";
        // this.type = "file"
        this.command = {
            command: 'nodeDependencies.openFileInEditor',
            title: 'Open File in Editor',
            arguments: [resourceUri]
        };
    }
}
class Dependency extends DependencyTreeItem {
    constructor(label, version, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.version = version;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.type = "dependency";
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'dependency.svg'),
            dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'dependency.svg')
        };
    }
    // contextValue = this.type;
    get tooltip() {
        return `${this.label}-${this.version}\n${this.contextValue}`;
    }
}
class Seperator extends DependencyTreeItem {
    constructor(label) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.type = "seperator";
    }
    get tooltip() {
        return `It is just a seperator, nothing to see here`;
    }
}
//# sourceMappingURL=nodeDependencies.js.map