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
const path = require("path");
const vscode = require("vscode");
const collection_1 = require("./collection");
const schematics_1 = require("./schematics");
const utils_1 = require("./utils");
class AngularSchematicsProvider {
    constructor() {
        this.workspaceRoot = '';
        this.defaultIconPath = '';
        this.materialIconsPath = '';
        this.materialIconsMap = new Map([
            ['default', 'angular.svg'],
            ['component', 'angular-component.svg'],
            ['directive', 'angular-directive.svg'],
            ['guard', 'angular-guard.svg'],
            ['pipe', 'angular-pipe.svg'],
            ['service', 'angular-service.svg'],
            ['appShell', 'angular.svg'],
            ['application', 'angular.svg'],
            ['class', 'angular.svg'],
            ['enum', 'angular.svg'],
            ['interface', 'angular.svg'],
            ['library', 'angular.svg'],
            ['module', 'angular.svg'],
            ['serviceWorker', 'angular.svg'],
            ['universal', 'angular.svg'],
            ['@ngrx/schematics:action', 'ngrx-actions.svg'],
            ['@ngrx/schematics:effect', 'ngrx-effects.svg'],
            ['@ngrx/schematics:entity', 'ngrx-entity.svg'],
            ['@ngrx/schematics:reducer', 'ngrx-reducer.svg'],
            ['@ngrx/schematics', 'ngrx-state.svg'],
            ['@ionic/angular-toolkit', 'ionic.svg'],
        ]);
        this.materialIconsExisting = new Set();
        this.materialIconsNotExisting = new Set();
        if (vscode.workspace.workspaceFolders) {
            this.workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        const schematicsExtension = vscode.extensions.getExtension('cyrilletuzi.angular-schematics');
        this.defaultIconPath = path.join(schematicsExtension.extensionPath, 'angular.svg');
        const iconTheme = vscode.workspace.getConfiguration('workbench').get('iconTheme');
        if (iconTheme === 'material-icon-theme') {
            const materialExtension = vscode.extensions.getExtension('PKief.material-icon-theme');
            if (materialExtension) {
                this.materialIconsPath = path.join(materialExtension.extensionPath, 'icons');
            }
        }
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.workspaceRoot) {
                if (!element) {
                    yield schematics_1.Schematics.load(this.workspaceRoot);
                    return Array.from(schematics_1.Schematics.collections).map((collection) => new vscode.TreeItem(collection, vscode.TreeItemCollapsibleState.Expanded));
                }
                else {
                    const collection = new collection_1.Collection(element.label);
                    const items = [];
                    if (yield collection.load(this.workspaceRoot)) {
                        for (const schemaName of collection.schemasNames) {
                            const item = new vscode.TreeItem(schemaName, vscode.TreeItemCollapsibleState.None);
                            item.command = {
                                title: `Generate ${schemaName}`,
                                command: 'ngschematics.generate',
                                arguments: [null, { collectionName: collection.name, schemaName }]
                            };
                            item.iconPath = yield this.getIconPath(collection.name, schemaName);
                            items.push(item);
                        }
                        return items;
                    }
                }
            }
            return [];
        });
    }
    getIconPath(collectionName, schemaName) {
        return __awaiter(this, void 0, void 0, function* () {
            let iconPath = this.defaultIconPath;
            if (this.materialIconsPath) {
                let materialIconPath = '';
                if (this.materialIconsMap.has(schemaName)) {
                    materialIconPath = path.join(this.materialIconsPath, this.materialIconsMap.get(schemaName));
                }
                else if (this.materialIconsMap.has(`${collectionName}:${schemaName}`)) {
                    materialIconPath = path.join(this.materialIconsPath, this.materialIconsMap.get(`${collectionName}:${schemaName}`));
                }
                else if (this.materialIconsMap.has(collectionName)) {
                    materialIconPath = path.join(this.materialIconsPath, this.materialIconsMap.get(collectionName));
                }
                else {
                    path.join(this.materialIconsPath, this.materialIconsMap.get('default'));
                }
                if (materialIconPath) {
                    if (this.materialIconsExisting.has(materialIconPath)) {
                        iconPath = materialIconPath;
                    }
                    else if (!this.materialIconsNotExisting.has(materialIconPath) && (yield utils_1.Utils.existsAsync(materialIconPath))) {
                        this.materialIconsExisting.add(materialIconPath);
                        iconPath = materialIconPath;
                    }
                    else {
                        this.materialIconsNotExisting.add(materialIconPath);
                    }
                }
            }
            return vscode.Uri.file(iconPath);
        });
    }
}
exports.AngularSchematicsProvider = AngularSchematicsProvider;
//# sourceMappingURL=view.js.map