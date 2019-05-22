"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colour_registry_1 = require("../colour-registry");
const decoration_1 = require("../entities/decoration");
const Option_1 = require("fp-ts/lib/Option");
const collection_1 = require("../common/collection");
class DecorationRegistry {
    constructor(configStore, generateUuid) {
        this.colourRegistry = new colour_registry_1.default(configStore);
        this.generateUuid = generateUuid;
        this.map = new collection_1.OptionMap();
    }
    inquireById(decorationId) {
        return this.map.get(decorationId);
    }
    inquireByPattern(pattern) {
        const isSamePattern = (decoration) => decoration.pattern.equalTo(pattern);
        return this.map.find(isSamePattern);
    }
    issue(pattern, colour) {
        const decorationOpt = this.inquireByPattern(pattern);
        return decorationOpt.isSome() ?
            Option_1.none :
            Option_1.some(this.setDecoration(this.createDecoration(pattern, colour)));
    }
    createDecoration(pattern, colour) {
        const id = this.generateUuid();
        if (colour) {
            this.colourRegistry.reserve(colour);
            return new decoration_1.Decoration(id, pattern, colour);
        }
        else {
            return new decoration_1.Decoration(id, pattern, this.colourRegistry.issue());
        }
    }
    update(oldDecoration, newDecoration) {
        this.map.set(newDecoration.id, newDecoration);
    }
    setDecoration(decoration) {
        this.map.set(decoration.id, decoration);
        return decoration;
    }
    revoke(decorationId) {
        const decoration = this.map.get(decorationId);
        decoration.map(d => {
            this.colourRegistry.revoke(d.colour);
            this.map.delete(decorationId);
        });
    }
    retrieveAll() {
        return this.map.toList();
    }
}
exports.default = DecorationRegistry;
//# sourceMappingURL=decoration-registry.js.map