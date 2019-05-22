"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function debounce(callback, delay) {
    let timeout;
    return (...args) => {
        const next = () => callback(...args);
        clearTimeout(timeout);
        timeout = setTimeout(next, delay);
    };
}
exports.default = debounce;
//# sourceMappingURL=debounce.js.map