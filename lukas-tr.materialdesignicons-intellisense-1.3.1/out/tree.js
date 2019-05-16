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
const configuration_1 = require("./configuration");
const util_1 = require("./util");
class IconTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData
            .event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return {
            contextValue: element.type === "icon"
                ? "mdiIcon"
                : element.type === "other"
                    ? "mdiSearch"
                    : "mdiTag",
            label: element.type === "other"
                ? element.label
                : element.type === "tag"
                    ? element.tag
                    : util_1.createCompletion(element.meta.name),
            iconPath: element.type === "icon" &&
                path.normalize(path.join(configuration_1.config.mdiPath, "svg", `${element.meta.name}.svg`)),
            collapsibleState: element.type === "tag" || element.type === "other"
                ? vscode.TreeItemCollapsibleState.Collapsed
                : undefined,
            command: element.type === "tag"
                ? undefined
                : element.type === "other"
                    ? element.command
                    : {
                        command: "materialdesigniconsIntellisense.openIconPreview",
                        arguments: [element],
                        title: "Open FTP Resource"
                    }
        };
    }
    getChildren(element) {
        return util_1.getMdiMetaData().then(d => {
            if (element) {
                let filtered = [];
                if (element.type === "tag") {
                    filtered = [...d].filter(a => (a.tags.length === 0 && element.tag === "Other") ||
                        a.tags.indexOf(element.tag) !== -1);
                }
                if (element.type === "other") {
                    const tokens = configuration_1.config.lastSearch
                        .split(/(\s|-)/)
                        .map(s => s.trim())
                        .filter(s => s);
                    filtered = [...d].filter(a => {
                        let matches = false;
                        tokens.forEach(token => {
                            [a.name, ...a.aliases].forEach(t => {
                                if (t.includes(token)) {
                                    matches = true;
                                }
                            });
                        });
                        return matches;
                    });
                    if (!filtered.length) {
                        vscode.window.showWarningMessage(`No icons found matching "${configuration_1.config.lastSearch}""`);
                    }
                }
                const children = filtered.map((child) => __awaiter(this, void 0, void 0, function* () {
                    return ({
                        type: "icon",
                        meta: child,
                        doc: yield util_1.getIconData(child)
                    });
                }));
                return Promise.all(children).then(c => {
                    c.sort((a, b) => (a.type === "icon" &&
                        b.type === "icon" &&
                        a.meta.name.localeCompare(b.meta.name)) ||
                        0);
                    return c;
                });
            }
            const tags = d.reduce((prev, cur) => (cur.tags.forEach(t => (prev[t] = true)), prev), {
                Other: true
            });
            const children = Object.keys(tags)
                .map((tag) => ({ type: "tag", tag }))
                .sort((a, b) => (a.type === "tag" &&
                b.type === "tag" &&
                a.tag.localeCompare(b.tag)) ||
                0);
            const searchResult = {
                type: "other",
                label: "Search results"
            };
            if (configuration_1.config.lastSearch) {
                children.unshift(searchResult);
            }
            return children;
        });
    }
    getParent(element) {
        return element.type === "tag" || element.type === "other"
            ? null
            : {
                type: "tag",
                tag: element.meta.tags[0] || "Other"
            };
        // const parent = element.resource.with ({   path:
        // dirname(element.resource.path) }) ; return parent.path !== '//'   ? {
        // resource: parent,     isDirectory: true   }   : null;
    }
    provideTextDocumentContent(uri, token) {
        return Promise.resolve("text");
    }
}
exports.IconTreeDataProvider = IconTreeDataProvider;
//# sourceMappingURL=tree.js.map