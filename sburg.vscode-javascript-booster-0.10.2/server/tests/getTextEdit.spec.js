"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getTextEdit_1 = require("../src/utils/getTextEdit");
describe('getTextEdit', () => {
    it('should replace all text', () => {
        const edit = getTextEdit_1.default('abc', 'def');
        expect(edit.range.start).toBe(0);
        expect(edit.range.end).toBe(3);
        expect(edit.newText).toBe('def');
    });
    it('should insert text at certain position (start > end case)', () => {
        const before = 'let a = 1;';
        const after = 'let a;\na = 1;';
        const edit = getTextEdit_1.default(before, after);
        expect(edit.range.start).toBe(5);
        expect(edit.range.end).toBe(5);
        expect(edit.newText).toBe(';\na');
    });
});
//# sourceMappingURL=getTextEdit.spec.js.map