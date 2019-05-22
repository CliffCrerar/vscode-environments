"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("../common/collection");
const decoration_type_creator_1 = require("./decoration-type-creator");
class DecorationTypeRegistry {
    constructor(configStore, window) {
        this.issued = new collection_1.OptionMap();
        this.decorationTypeCreator = new decoration_type_creator_1.default(configStore, window);
    }
    inquire(decorationId) {
        return this.issued.get(decorationId);
    }
    revoke(id) {
        this.issued.delete(id);
    }
    provideFor(decoration) {
        const found = this.inquire(decoration.id).toUndefined();
        return found ? found : this.issue(decoration);
    }
    issue(decoration) {
        const decorationType = this.decorationTypeCreator.create(decoration.colour);
        this.issued.set(decoration.id, decorationType);
        return decorationType;
    }
}
exports.DecorationTypeRegistry = DecorationTypeRegistry;
//# sourceMappingURL=decoration-type-registry.js.map