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
                if (utils_1.Utils.isSchemaLocal(this.collection.name)) {
                    schema = yield utils_1.Utils.getSchemaFromLocal(cwd, this.path);
                }
                else {
                    schema = yield utils_1.Utils.getSchemaFromNodeModules(cwd, this.collection.name, this.path);
                }
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
            let prompt = `Name or path/name ${project ? `in project '${project}'` : 'in default project'}?`;
            if (!contextPath || !project) {
                prompt = `${prompt} Pro-tip: the path and project can be auto-inferred if you launch the command with a right-click on the directory where you want to generate.`;
            }
            /** @todo Investigate if there could be other default option than name */
            return vscode.window.showInputBox({
                prompt,
                value: contextPath,
                valueSelection: [contextPath.length, contextPath.length],
                ignoreFocusOut: true,
            });
        });
    }
    askOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const choices = [];
            this.options.forEach((option, optionName) => {
                /* Do not keep:
                 * - options marked as not visible (internal options for the CLI)
                 * - deprecated options
                 * - option already managed by command line args (like name)
                 */
                if (option.visible !== false && !('x-deprecated' in option) &&
                    !(option.$default && option.$default.$source === 'argv')) {
                    const picked = !!
                    /* Do not pre-select options with defaults values, as the CLI will take care of them */
                    (!('$default' in option) && (
                    /* Pre-select required and suggested (x-prompt) properties */
                    (this.requiredOptions.indexOf(optionName) !== -1) || ('x-prompt' in option)));
                    /* UX: inform the user why some options are pre-select */
                    const requiredTip = (!('$default' in option) && (this.requiredOptions.indexOf(optionName) !== -1)) ? '(required) ' : '';
                    const suggestedTip = (!('$default' in option) && !requiredTip && ('x-prompt' in option)) ? '(suggested) ' : '';
                    choices.push({
                        label: optionName,
                        description: `${requiredTip}${suggestedTip}${option.description}`,
                        picked
                    });
                }
            });
            /* Sort in alphabetical order */
            const sortedPickedChoices = choices
                .filter((choice) => choice.picked)
                .sort((a, b) => a.label.localeCompare(b.label));
            const sortedOptionalChoices = choices
                .filter((choice) => !choice.picked)
                .sort((a, b) => a.label.localeCompare(b.label));
            /* Required and suggested options first */
            const sortedChoices = [...sortedPickedChoices, ...sortedOptionalChoices];
            const selectedOptions = (yield vscode.window.showQuickPick(sortedChoices, {
                canPickMany: true,
                placeHolder: `Do you need some options? (if not, just press Enter to skip this step)`,
                ignoreFocusOut: true,
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
                const promptSchema = option['x-prompt'];
                const prompt = (promptSchema && promptSchema.message) ? promptSchema.message : option.description;
                if (option.enum !== undefined) {
                    /** @todo Put default value last in choices */
                    /** @todo Take user defaults in angular.json into account in ordering */
                    choice = yield this.askEnumOption(optionName, option.enum, prompt);
                }
                else if (option.type === 'boolean') {
                    /** @todo Take user defaults in angular.json into account in ordering */
                    const choices = (option.default === true) ? ['false', 'true'] : ['true', 'false'];
                    choice = yield this.askEnumOption(optionName, choices, prompt);
                }
                /* Only makes sense if the option is an array AND have suggestions,
                 * otherwise the user must manually type the value in a classic text input box */
                else if ((option.type === 'array') && promptSchema && promptSchema.items) {
                    if (promptSchema.multiselect) {
                        choice = yield this.askMultiselectOption(optionName, promptSchema.items, prompt);
                    }
                    else {
                        choice = yield this.askEnumOption(optionName, promptSchema.items, prompt);
                    }
                }
                else {
                    choice = yield vscode.window.showInputBox({
                        placeHolder: `--${optionName}`,
                        prompt,
                        ignoreFocusOut: true,
                    });
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
            return vscode.window.showQuickPick(choices, {
                placeHolder: `--${optionName}${placeholder ? `: ${placeholder}` : ''}`,
                ignoreFocusOut: true,
            });
        });
    }
    askMultiselectOption(optionName, choices, placeholder = '') {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode.window.showQuickPick(choices, {
                placeHolder: `--${optionName}${placeholder ? `: ${placeholder}` : ''}`,
                canPickMany: true,
                ignoreFocusOut: true,
            });
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
//# sourceMappingURL=schema.js.map