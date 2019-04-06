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
const exec_1 = require("./exec");
function default_1(filesRelativePaths = []) {
    return __awaiter(this, void 0, void 0, function* () {
        const allIndex = filesRelativePaths.indexOf('*');
        if (allIndex !== -1)
            filesRelativePaths.splice(allIndex, 1);
        const command = 'git';
        const args = ['reset'].concat(filesRelativePaths);
        return exec_1.default(command, args);
    });
}
exports.default = default_1;