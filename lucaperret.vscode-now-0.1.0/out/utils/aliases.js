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
const moment = require("moment");
const config_1 = require("../config");
const common_1 = require("./common");
function getAliases() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield common_1.request('GET', config_1.default.ENDPOINTS.ALIASES, true);
        return response.aliases;
    });
}
exports.getAliases = getAliases;
function getAliasNames() {
    return __awaiter(this, void 0, void 0, function* () {
        const aliases = yield getAliases();
        return aliases.map(alias => ({
            label: alias.alias,
            description: 'Alias created ' + moment(alias.created).fromNow()
        }));
    });
}
exports.getAliasNames = getAliasNames;
function deleteAlias(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield common_1.request('DELETE', config_1.default.ENDPOINTS.ALIASES + '/' + id, true);
    });
}
exports.deleteAlias = deleteAlias;
//# sourceMappingURL=aliases.js.map