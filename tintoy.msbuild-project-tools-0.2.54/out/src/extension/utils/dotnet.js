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
const mz_1 = require("mz");
const executables = require("./executables");
/**
 * Get the current version of .NET Core.
 *
 * @returns A promise that resolves to the current .NET Core version, or null if the version could not be determined.
 */
function getVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const dotnetExecutable = yield executables.find('dotnet');
        if (dotnetExecutable === null)
            return '';
        const [stdOut, stdError] = yield mz_1.child_process.execFile(dotnetExecutable, ['--version']);
        return stdOut.trim();
    });
}
exports.getVersion = getVersion;
//# sourceMappingURL=dotnet.js.map