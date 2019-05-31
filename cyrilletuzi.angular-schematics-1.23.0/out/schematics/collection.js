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
const vscode = require("vscode");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
class Collection {
    constructor(name) {
        this.path = '';
        this.schemas = new Map();
        this.name = name;
    }
    get schemasNames() {
        return Array.from(this.schemas.keys()).sort();
    }
    load(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            let collection = null;
            const cachedCollection = Collection.cache.get(this.name);
            if (cachedCollection) {
                collection = cachedCollection;
            }
            else {
                if (utils_1.Utils.isSchemaLocal(this.name)) {
                    collection = yield utils_1.Utils.getSchemaFromLocal(cwd, this.name);
                    if (collection) {
                        collection.path = utils_1.Utils.getDirectoryFromFilename(this.name);
                    }
                }
                else {
                    const collectionPackage = yield utils_1.Utils.getSchemaFromNodeModules(cwd, this.name, 'package.json');
                    if (!collectionPackage || !collectionPackage.schematics) {
                        return false;
                    }
                    collection = yield utils_1.Utils.getSchemaFromNodeModules(cwd, this.name, utils_1.Utils.pathTrimRelative(collectionPackage.schematics));
                    if (collection) {
                        collection.path = utils_1.Utils.pathTrimRelative(collectionPackage.schematics);
                    }
                }
            }
            if (collection) {
                this.path = collection.path;
                yield this.initSchemasMap(collection, cwd);
                Collection.cache.set(this.name, collection);
                return true;
            }
            return false;
        });
    }
    createSchema(name, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            let collection = this;
            const schema = this.schemas.get(name);
            if (schema.extends) {
                const [parentCollectionName] = schema.extends.split(':');
                collection = new Collection(parentCollectionName);
                yield collection.load(cwd);
            }
            return new schema_1.Schema(name, collection);
        });
    }
    askSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            const choices = this.schemasNames
                .map((schemaName) => ({
                label: schemaName,
                description: this.schemas.get(schemaName).description
            }));
            const choice = yield vscode.window.showQuickPick(choices, {
                placeHolder: `What do you want to generate?`,
                ignoreFocusOut: true,
            });
            return choice ? choice.label : undefined;
        });
    }
    initSchemasMap(collection, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let schemaName in collection.schematics) {
                if (collection.schematics.hasOwnProperty(schemaName)
                    && !collection.schematics[schemaName].hidden
                    && (schemaName !== 'ng-add')) {
                    const schema = collection.schematics[schemaName];
                    if (schema.extends) {
                        const [parentCollectionName, parentSchemaName] = schema.extends.split(':');
                        const parentCollection = new Collection(parentCollectionName);
                        yield parentCollection.load(cwd);
                        const parentSchema = Object.assign({}, parentCollection.schemas.get(parentSchemaName));
                        parentSchema.extends = schema.extends;
                        this.schemas.set(schemaName, parentSchema);
                    }
                    else {
                        this.schemas.set(schemaName, collection.schematics[schemaName]);
                    }
                }
            }
        });
    }
}
Collection.cache = new Map();
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map