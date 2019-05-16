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
const util_1 = require("./util");
class HoverProvider {
    provideHover(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const regex = /mdi((\w+)|(-|:)((\w|\-)+))/i;
            const range = document.getWordRangeAtPosition(position, regex);
            if (!range) {
                return null;
            }
            const text = document.getText(range);
            const match = regex.exec(text);
            if (!match) {
                return null;
            }
            const iconName = match[4] || util_1.pascalCaseToKebabCase(match[2]);
            const meta = yield util_1.getMdiMetaData();
            for (const item of meta) {
                const isIcon = iconName === item.name;
                if (isIcon) {
                    const meta = yield util_1.getIconData(item);
                    const hover = {
                        range,
                        contents: [
                            meta.icon,
                            meta.tags,
                            `aliases: ${meta.aliases}`,
                            meta.link
                        ]
                    };
                    return hover;
                }
            }
            const hover = {
                range,
                contents: [`no preview available for mdi-${iconName}`]
            };
            return hover;
        });
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hover.js.map