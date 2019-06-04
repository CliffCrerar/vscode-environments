"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options = [
    { value: 'add', label: 'add' },
    { value: 'create', label: 'create' },
    { value: 'delete', label: 'delete/remove' },
    { value: 'show', label: 'show/view' },
    { value: 'restore', label: 'restore' },
    { value: 'clean', label: 'clean' },
    { value: 'run', label: 'run' },
    { value: 'publish', label: 'publish' }
];
exports.primaryOptions = options.sort((x, y) => {
    if (x.value < y.value) {
        return -1;
    }
    if (x.value > y.value) {
        return 1;
    }
    return 0;
});
//# sourceMappingURL=primary-options.js.map