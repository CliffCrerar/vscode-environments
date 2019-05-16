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
const util_1 = require("./util");
const types_1 = require("./types");
const configuration_1 = require("./configuration");
class CompletionProvider {
    provideCompletionItems(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            let linePrefix = document
                .lineAt(position)
                .text.substr(0, position.character);
            const match = linePrefix.match(/mdi(-)?(:)?([-\w]+?)?$/);
            if (!match) {
                return [];
            }
            const completionType = match[1]
                ? types_1.CompletionType.kebabCase
                : match[2]
                    ? types_1.CompletionType.homeAssistant
                    : types_1.CompletionType.camelCase;
            const meta = yield util_1.getMdiMetaData();
            const additionalTextEdits = configuration_1.config
                .insertTypeSpecificConfig(completionType)
                .noTextDeletionLanguages.indexOf(document.languageId) === -1
                ? [
                    vscode.TextEdit.delete(new vscode.Range(position.line, position.character - match[0].length, position.line, position.character))
                ]
                : [];
            return {
                incomplete: true,
                items: meta.reduce((prev, cur) => prev.concat([cur.name, ...(configuration_1.config.includeAliases ? cur.aliases : [])].map((name) => ({
                    label: util_1.createCompletion(name, completionType),
                    kind: vscode.CompletionItemKind.Text,
                    sortText: name,
                    meta: cur,
                    completionType,
                    additionalTextEdits
                }))), [])
            };
        });
    }
    resolveCompletionItem(item, token) {
        return util_1.getIconData(item.meta).then(data => {
            return Object.assign({}, item, { documentation: data.icon.appendMarkdown(`
- link: ${data.link.value}
- aliases: ${data.aliases}
- codepoint: ${data.codepoint}
- author: ${data.author}
- version: ${data.version}`), detail: data.tags, insertText: `${configuration_1.config.prefix}${util_1.createCompletion(item.meta.name, item.completionType)}${configuration_1.config.suffix}` });
        });
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completion.js.map