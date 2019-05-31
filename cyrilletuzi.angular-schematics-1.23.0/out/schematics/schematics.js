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
const utils_1 = require("./utils");
const angular_config_1 = require("./angular-config");
class Schematics {
    static load(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const collectionsNames = [...this.commonCollections];
            const userConfiguration = vscode.workspace.getConfiguration().get('ngschematics');
            if (userConfiguration && userConfiguration.schematics) {
                collectionsNames.push(...userConfiguration.schematics);
            }
            const existingCollections = [];
            for (let collectionName of collectionsNames) {
                if (this.collections.has(collectionName)) {
                    existingCollections.push(collectionName);
                }
                else {
                    let collectionExists = false;
                    if (utils_1.Utils.isSchemaLocal(collectionName)) {
                        collectionExists = yield utils_1.Utils.existsAsync(path.join(cwd, collectionName));
                    }
                    else {
                        collectionExists = yield utils_1.Utils.existsAsync(utils_1.Utils.getNodeModulesPath(cwd, collectionName));
                    }
                    if (collectionExists) {
                        existingCollections.push(collectionName);
                    }
                }
            }
            this.collections = new Set([angular_config_1.AngularConfig.defaultCollection, angular_config_1.AngularConfig.cliCollection, ...existingCollections]);
        });
    }
    static askSchematic() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.collections.size === 1) {
                return angular_config_1.AngularConfig.cliCollection;
            }
            else {
                return vscode.window.showQuickPick(Array.from(this.collections), {
                    placeHolder: `From which schematics collection?`,
                    ignoreFocusOut: true,
                });
            }
        });
    }
}
Schematics.commonCollections = [
    '@angular/material',
    '@ionic/angular-toolkit',
    '@ngrx/schematics',
    '@ngxs/schematics',
    '@nativescript/schematics',
    '@nrwl/schematics',
    '@nstudio/schematics',
    '@ngx-formly/schematics',
    'primeng-schematics',
    '@ngx-kit/collection',
    'ngx-spec',
    './schematics/collection.json'
];
Schematics.collections = new Set();
exports.Schematics = Schematics;
//# sourceMappingURL=schematics.js.map