"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ngFileType_1 = require("./ngFileType");
class NgObjectType {
    constructor(identifier, label, possibleFileTypes, priority = 0) {
        this.identifier = identifier;
        this.label = label;
        this.possibleFileTypes = possibleFileTypes;
        this.priority = priority;
    }
    static getByIdentifier(identifier) {
        return this.types.find(type => type.identifier === identifier);
    }
    has(fileType) {
        return this.possibleFileTypes.indexOf(fileType) > -1;
    }
}
NgObjectType.types = [
    new NgObjectType('component', 'Components', [ngFileType_1.NgFileType.Script, ngFileType_1.NgFileType.Template, ngFileType_1.NgFileType.Style, ngFileType_1.NgFileType.Spec], 10),
    new NgObjectType('service', 'Services', [ngFileType_1.NgFileType.Script, ngFileType_1.NgFileType.Spec], 8),
    new NgObjectType('directive', 'Directives', [ngFileType_1.NgFileType.Script, ngFileType_1.NgFileType.Spec], 5),
    new NgObjectType('pipe', 'Pipes', [ngFileType_1.NgFileType.Script, ngFileType_1.NgFileType.Spec], 4),
    new NgObjectType('guard', 'Guards', [ngFileType_1.NgFileType.Script, ngFileType_1.NgFileType.Spec], 3),
    new NgObjectType('module', 'Modules', [ngFileType_1.NgFileType.Script], 1),
];
exports.NgObjectType = NgObjectType;
//# sourceMappingURL=ngObjectType.js.map