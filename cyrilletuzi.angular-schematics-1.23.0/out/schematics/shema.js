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
const path = require("path");
const utils_1 = require("./utils");
class Schema {
    constructor(name, collection) {
        this.path = '';
        this.requiredOptions = [];
        this.options = new Map();
        this.name = name;
        this.collection = collection;
    }
    get optionsNames() {
        return Array.from(this.options.keys()).sort();
    }
    load(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            let schema = null;
            const cachedSchema = Schema.cache.get(`${this.collection}:${this.name}`);
            if (cachedSchema) {
                schema = cachedSchema;
            }
            else {
                this.path = path.join(utils_1.Utils.getDirectoryFromFilename(this.collection.path), utils_1.Utils.pathTrimRelative(this.collection.schemas.get(this.name).schema));
                schema = yield utils_1.Utils.getSchemaFromNodeModules(cwd, this.collection.name, this.path);
            }
            if (schema) {
                this.initOptionsMap(schema);
                this.requiredOptions = schema.required || [];
                Schema.cache.set(`${this.collection}:${this.name}`, schema);
                return true;
            }
            return false;
        });
    }
    hasDefaultOption() {
        for (let option of this.options.values()) {
            if ((option.$default && (option.$default.$source === 'argv') && (option.$default.index === 0))
                || (this.requiredOptions.indexOf('name') !== -1)) {
                return true;
            }
        }
        return false;
    }
    hasPath() {
        return this.options.has('path');
    }
    askDefaultOption(contextPath = '', project = '') {
        return __awaiter(this, void 0, void 0, function* () {
            /** @todo Investigate if there could be other default option than name */
            return vscode.window.showInputBox({
                prompt: `Name or pathname${project ? ` in project ${project}` : ''}?`,
                value: contextPath,
                valueSelection: [contextPath.length, contextPath.length]
            });
        });
    }
    askOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const choices = [];
            this.options.forEach((option, optionName) => {
                if (option.visible !== false) {
                    choices.push({ label: optionName, description: option.description });
                }
            });
            const sortedChoices = choices.sort((a, b) => a.label.localeCompare(b.label));
            const selectedOptions = (yield vscode.window.showQuickPick(sortedChoices, {
                canPickMany: true,
                placeHolder: `Do you need some options?`
            })) || [];
            return selectedOptions.map((selectedOption) => selectedOption.label);
        });
    }
    askOptionsValues(optionsNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = this.filterSelectedOptions(optionsNames);
            const filledOptions = new Map();
            for (let [optionName, option] of options) {
                let choice = '';
                if (option.enum !== undefined) {
                    /** @todo Put default value last in choices */
                    /** @todo Take user defaults in angular.json into account in ordering */
                    choice = yield this.askEnumOption(optionName, option.enum, option.description);
                }
                else if (option.type === 'boolean') {
                    /** @todo Take user defaults in angular.json into account in ordering */
                    const choices = (option.default === true) ? ['false', 'true'] : ['true', 'false'];
                    choice = yield this.askEnumOption(optionName, choices, option.description);
                }
                else {
                    choice = yield vscode.window.showInputBox({ placeHolder: `--${optionName}`, prompt: option.description });
                }
                if (choice) {
                    filledOptions.set(optionName, choice);
                }
            }
            return filledOptions;
        });
    }
    askEnumOption(optionName, choices, placeholder = '') {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.window.showQuickPick(choices, { placeHolder: `--${optionName}${placeholder ? `: ${placeholder}` : ''}` });
        });
    }
    initOptionsMap(schema) {
        for (let optionName in schema.properties) {
            if (schema.properties.hasOwnProperty(optionName)) {
                this.options.set(optionName, schema.properties[optionName]);
            }
        }
    }
    filterSelectedOptions(selectedOptionsNames) {
        const selectedOptions = new Map();
        selectedOptionsNames.forEach((selectedOptionName) => {
            const option = this.options.get(selectedOptionName);
            if (option) {
                selectedOptions.set(selectedOptionName, option);
            }
        });
        this.requiredOptions.forEach((requiredOptionName) => {
            const requiredOptionData = this.options.get(requiredOptionName);
            /* Filter options with $default values already managed by the CLI */
            if (requiredOptionName !== 'name' && requiredOptionData && !('$default' in requiredOptionData)) {
                selectedOptions.set(requiredOptionName, this.options.get(requiredOptionName));
            }
        });
        return selectedOptions;
    }
}
Schema.cache = new Map();
exports.Schema = Schema;
//# sourceMappingURL=shema.js.map