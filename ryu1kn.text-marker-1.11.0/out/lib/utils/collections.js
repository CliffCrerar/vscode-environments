"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Option_1 = require("fp-ts/lib/Option");
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
}
exports.OptionMap = OptionMap;
//# sourceMappingURL=collections.js.map