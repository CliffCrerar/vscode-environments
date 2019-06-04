"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Guid {
    //mask exampl ('xxxxxxx-xxx-xx-45xxxx')
    static newGuid(mask) {
        return mask.replace(/[x]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
exports.Guid = Guid;
//# sourceMappingURL=utils.js.map