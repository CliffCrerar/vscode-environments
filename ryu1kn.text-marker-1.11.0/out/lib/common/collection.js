"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Option_1 = require("fp-ts/lib/Option");
const Array_1 = require("fp-ts/lib/Array");
function toMap(object) {
    const tuples = Object.entries(object).reduce((previous, currentValue) => [...previous, currentValue], []);
    return new Map(tuples);
}
class OptionMap {
    constructor(object = {}) {
        this.map = toMap(object);
    }
    set(key, value) {
        this.map.set(key, value);
    }
    get(key) {
        return Option_1.fromNullable(this.map.get(key));
    }
    delete(key) {
        this.map.delete(key);
    }
    values() {
        return this.map.values();
    }
    entries() {
        return this.map.entries();
    }
    toList() {
        return Array.from(this.values());
    }
    find(predicate) {
        return Array_1.findFirst(this.toList(), predicate);
    }
}
exports.OptionMap = OptionMap;
//# sourceMappingURL=collection.js.map