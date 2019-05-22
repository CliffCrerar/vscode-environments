"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Option_1 = require("fp-ts/lib/Option");
function toFuture(value) {
    return value.fold(Promise.resolve(Option_1.none), p => p.then(v => Option_1.some(v)));
}
function mapToFuture(value, futurise) {
    return toFuture(value.map(futurise));
}
exports.mapToFuture = mapToFuture;
//# sourceMappingURL=optional.js.map