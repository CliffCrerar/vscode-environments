"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const configuration_1 = require("./configuration");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
exports.getMdiMetaData = () => new Promise((resolve, reject) => {
    fs.readFile(configuration_1.config.mdiMetaDataPath, (err, data) => {
        if (err) {
            reject(err);
            return;
        }
        return resolve(JSON.parse(data.toString("utf8")));
    });
});
exports.encodeSpaces = (content) => {
    return content.replace(/ /g, "%20");
};
exports.getIconData = (item) => {
    const svgPath = path.normalize(path.join(configuration_1.config.mdiPath, "svg", `${item.name}.svg`));
    return new Promise((resolve, reject) => {
        fs.readFile(svgPath, (err, data) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
                return reject(err);
            }
            const utf8String = data
                .toString("utf8")
                .replace(/<path/gi, `<path fill="${configuration_1.config.iconColor}" `);
            const previewSvg = "data:image/svg+xml;utf8;base64," +
                Buffer.from(utf8String).toString("base64") +
                exports.encodeSpaces(` | width=${configuration_1.config.iconSize} height=${configuration_1.config.iconSize}`);
            return resolve({
                aliases: [item.name, ...item.aliases].join(", "),
                author: item.author,
                codepoint: item.codepoint,
                name: item.name,
                tags: item.tags.join(", ") || "Other",
                version: item.version,
                link: new vscode.MarkdownString(`[docs](https://materialdesignicons.com/icon/${item.name})`),
                icon: new vscode.MarkdownString(`![preview](${previewSvg})`),
                rawIcon: utf8String
            });
        });
    });
};
exports.createCompletion = (iconName, type) => {
    if (typeof type === "undefined") {
        type = configuration_1.config.insertType;
    }
    switch (type) {
        case types_1.CompletionType.camelCase:
            return exports.kebabCaseToCamelCase(`mdi-${iconName}`);
        case types_1.CompletionType.kebabCase:
            return `mdi-${iconName}`;
        case types_1.CompletionType.homeAssistant:
            return `mdi:${iconName}`;
        default:
            exports.assertNever(type);
            return `mdi-${iconName}`;
    }
};
exports.kebabCaseToCamelCase = (kebabStr) => kebabStr.replace(/-([a-z0-9])/g, match => {
    return match[1].toUpperCase();
});
exports.pascalCaseToKebabCase = (pascalStr) => pascalStr.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
exports.assertNever = (x) => {
    const channel = vscode.window.createOutputChannel("Material Design Icons Intellisense");
    channel.show();
    const msg = `Unexpected object: ${JSON.stringify(x)}\n`;
    channel.appendLine(msg);
};
//# sourceMappingURL=util.js.map