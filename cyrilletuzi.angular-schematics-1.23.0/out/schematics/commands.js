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
const generate_1 = require("./generate");
const output_1 = require("./output");
const schematics_1 = require("./schematics");
const utils_1 = require("./utils");
const angular_config_1 = require("./angular-config");
class Commands {
    static getContextPath(context) {
        /* Check if there is an Explorer context (command could be launched from Palette too, where there is no context) */
        return (typeof context === 'object') && (context !== null) && ('path' in context) ? context.path : '';
    }
    static getDefaultWorkspace() {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1) {
            return vscode.workspace.workspaceFolders[0];
        }
        return null;
    }
    static getWorkspaceFolderPath(path = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceFolder = path ?
                vscode.workspace.getWorkspaceFolder(vscode.Uri.file(path)) :
                (this.getDefaultWorkspace() || (yield vscode.window.showWorkspaceFolderPick()));
            return workspaceFolder ? workspaceFolder.uri.fsPath : '';
        });
    }
    static generate(context, { collectionName, schemaName } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const shortcutCommand = (collectionName && schemaName) ? true : false;
            const contextPath = this.getContextPath(context);
            const workspaceFolderPath = yield this.getWorkspaceFolderPath(contextPath);
            if (!workspaceFolderPath) {
                return;
            }
            yield angular_config_1.AngularConfig.init(workspaceFolderPath);
            const generate = new generate_1.Generate(contextPath, workspaceFolderPath);
            if (collectionName !== angular_config_1.AngularConfig.cliCollection) {
                yield schematics_1.Schematics.load(workspaceFolderPath);
                if (!collectionName) {
                    collectionName = yield schematics_1.Schematics.askSchematic();
                    if (!collectionName) {
                        return;
                    }
                }
                generate.addCollection(collectionName);
                /* Special case: ngx-spec needs a special path */
                if (collectionName === 'ngx-spec') {
                    generate.resetCommandPath(contextPath);
                }
            }
            const collection = new collection_1.Collection(collectionName);
            if (!(yield collection.load(workspaceFolderPath))) {
                return;
            }
            if (!schemaName) {
                schemaName = yield collection.askSchema();
                if (!schemaName) {
                    return;
                }
            }
            generate.addSchema(schemaName);
            const schema = yield collection.createSchema(schemaName, workspaceFolderPath);
            if (!(yield schema.load(workspaceFolderPath))) {
                return;
            }
            if (schema.hasDefaultOption()) {
                const defaultOption = yield schema.askDefaultOption(generate.path, generate.project);
                if (!defaultOption) {
                    return;
                }
                generate.addDefaultOption(defaultOption, schema.hasPath());
            }
            let filledOptions;
            if (shortcutCommand && (collectionName === angular_config_1.AngularConfig.cliCollection) && (schemaName === 'component')) {
                filledOptions = yield this.askComponentOptions(schema);
            }
            else if (shortcutCommand && (collectionName === angular_config_1.AngularConfig.cliCollection) && (schemaName === 'module')) {
                filledOptions = yield this.askModuleOptions(schema);
            }
            else {
                filledOptions = yield this.askOptions(schema);
            }
            if (!filledOptions) {
                return;
            }
            filledOptions.forEach((option, optionName) => {
                generate.addOption(optionName, option);
            });
            const confirm = yield generate.askConfirmation();
            if (confirm) {
                yield this.launchCommand(generate, workspaceFolderPath);
            }
        });
    }
    /** @todo Colored output? */
    static launchCommand(generate, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            output_1.Output.channel.show();
            output_1.Output.channel.appendLine(generate.command);
            try {
                const stdout = yield utils_1.Utils.execAsync(yield generate.getExecCommand(cwd), cwd);
                output_1.Output.channel.appendLine(stdout);
                yield vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
                vscode.window.setStatusBarMessage(`Schematics worked!`, 5000);
                try {
                    yield this.jumpToFile(stdout, cwd, generate.defaultOption, generate.schema);
                }
                catch (error) { }
            }
            catch (error) {
                output_1.Output.channel.append(error[0]);
                output_1.Output.channel.appendLine(error[1]);
                vscode.window.showErrorMessage(`Schematics failed, see Output.`);
            }
        });
    }
    static jumpToFile(stdout, cwd, defaultOption, schema) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = defaultOption.includes('/') ? defaultOption.substr(defaultOption.lastIndexOf('/') + 1) : defaultOption;
            const stdoutRegExp = new RegExp(`CREATE (.*${name}(?:\.${schema})?\.ts)`);
            const stdoutMatches = stdout.match(stdoutRegExp);
            if (stdoutMatches) {
                const document = yield vscode.workspace.openTextDocument(path.join(cwd, stdoutMatches[1]));
                yield vscode.window.showTextDocument(document);
            }
        });
    }
    static askOptions(schema) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedOptionsNames = yield schema.askOptions();
            if (selectedOptionsNames) {
                return yield schema.askOptionsValues(selectedOptionsNames);
            }
            return new Map();
        });
    }
    static askComponentOptions(schema) {
        return __awaiter(this, void 0, void 0, function* () {
            const TYPE_CLASSIC = `Classic component`;
            const TYPE_EXPORTED = `Exported component`;
            const TYPE_PURE = `Pure component`;
            const TYPE_EXPORTED_PURE = `Exported pure component`;
            const TYPE_ELEMENT = `Element component`;
            const TYPE_ADVANCED = `Advanced component`;
            const componentTypes = [
                { label: TYPE_CLASSIC, description: `No option` },
                { label: TYPE_EXPORTED, description: `--export (no other option)` },
                { label: TYPE_PURE, description: `--changeDetection OnPush (no other option)` },
                { label: TYPE_EXPORTED_PURE, description: `--export --changeDetection OnPush (no other option)` },
            ];
            const viewEncapsulation = schema.options.get('viewEncapsulation');
            if (schema.options.get('entryComponent') && viewEncapsulation && viewEncapsulation.enum && (viewEncapsulation.enum.indexOf('ShadowDom') !== -1)) {
                componentTypes.push({ label: TYPE_ELEMENT, description: `--entryComponent --viewEncapsulation ShadowDom` });
            }
            componentTypes.push({ label: TYPE_ADVANCED, description: `You'll be able to choose all available options` });
            const componentType = yield vscode.window.showQuickPick(componentTypes, {
                placeHolder: `What type of component do you want?`,
                ignoreFocusOut: true,
            });
            if (!componentType) {
                return undefined;
            }
            let componentOptions = new Map();
            switch (componentType.label) {
                case TYPE_EXPORTED:
                    componentOptions.set('export', 'true');
                    break;
                case TYPE_PURE:
                    componentOptions.set('changeDetection', 'OnPush');
                    break;
                case TYPE_EXPORTED_PURE:
                    componentOptions.set('export', 'true');
                    componentOptions.set('changeDetection', 'OnPush');
                    break;
                case TYPE_ELEMENT:
                    componentOptions.set('entryComponent', 'true');
                    componentOptions.set('viewEncapsulation', 'ShadowDom');
                    break;
            }
            if (componentType.label === TYPE_ADVANCED) {
                componentOptions = yield this.askOptions(schema);
            }
            return componentOptions;
        });
    }
    static askModuleOptions(schema) {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleTypes = [
                { label: `Classic module`, description: `No option` },
                { label: `Classic module, imported`, description: `--module app (no other option)` },
                { label: `Module with routing, imported`, description: `--routing --module app (no other option)` },
                { label: `Advanced module`, description: `You'll be able to choose all available options` },
            ];
            const moduleType = yield vscode.window.showQuickPick(moduleTypes, {
                placeHolder: `What type of module do you want?`,
                ignoreFocusOut: true,
            });
            if (!moduleType) {
                return undefined;
            }
            let moduleOptions = new Map();
            switch (moduleType.label) {
                case moduleTypes[1].label:
                    moduleOptions.set('module', 'app');
                    break;
                case moduleTypes[2].label:
                    moduleOptions.set('routing', 'true');
                    moduleOptions.set('module', 'app');
                    break;
            }
            if (moduleType.label === moduleTypes[3].label) {
                moduleOptions = yield this.askOptions(schema);
            }
            return moduleOptions;
        });
    }
}
exports.Commands = Commands;
//# sourceMappingURL=commands.js.map