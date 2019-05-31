"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hexFormat(value, padding = 8, includePrefix = true) {
    let base = value.toString(16);
    while (base.length < padding) {
        base = '0' + base;
    }
    return includePrefix ? '0x' + base : base;
}
exports.hexFormat = hexFormat;
function binaryFormat(value, padding = 0, includePrefix = true, group = false) {
    let base = (value >>> 0).toString(2);
    while (base.length < padding) {
        base = '0' + base;
    }
    if (group) {
        const nibRem = 4 - (base.length % 4);
        for (let i = 0; i < nibRem; i++) {
            base = '0' + base;
        }
        const groups = base.match(/[01]{4}/g);
        base = groups.join(' ');
        base = base.substring(nibRem);
    }
    return includePrefix ? '0b' + base : base;
}
exports.binaryFormat = binaryFormat;
function createMask(offset, width) {
    let r = 0;
    const a = offset;
    const b = offset + width - 1;
    for (let i = a; i <= b; i++) {
        r = (r | (1 << i)) >>> 0;
    }
    return r;
}
exports.createMask = createMask;
function extractBits(value, offset, width) {
    const mask = createMask(offset, width);
    const bvalue = ((value & mask) >>> offset) >>> 0;
    return bvalue;
}
exports.extractBits = extractBits;
//# sourceMappingURL=utils.js.map