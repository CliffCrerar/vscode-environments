"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CliHelper {
    static ParseListResult(listReferencesOutput) {
        if (listReferencesOutput.indexOf(this.referenceListSeparator) > -1) {
            const projectString = listReferencesOutput.split(this.referenceListSeparator)[1];
            const projects = projectString.split("\n").map(value => value.trim()).filter(v => v !== '');
            return projects;
        }
        return [];
    }
}
CliHelper.referenceListSeparator = "--------------------";
exports.CliHelper = CliHelper;
//# sourceMappingURL=cliHelper.js.map