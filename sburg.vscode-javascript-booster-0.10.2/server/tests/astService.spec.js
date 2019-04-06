"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const os = require("os");
const vscode = require("vscode-languageserver-types");
const astService_1 = require("../src/services/astService");
describe('astService', () => {
    const eolLength = os.EOL.length;
    it('offsetAt() should compute line', () => {
        const actual = astService_1.default.offsetAt(`let a;\nlet b;\r\nlet c;\nlet d;`, vscode.Position.create(3, 0));
        const expected = (6 + eolLength) * 3;
        assert.equal(actual, expected, 'offsets must match');
    });
    it('offsetAt() should compute character', () => {
        const actual = astService_1.default.offsetAt(`let a;\nlet b;`, vscode.Position.create(1, 4));
        const expected = 6 + os.EOL.length + 4;
        assert.equal(actual, expected, 'offsets must match');
    });
    it('positionAt() should compute line', () => {
        const actual = astService_1.default.positionAt(`let a;\nlet b;\r\nlet c;\nlet d;`, (6 + eolLength) * 3);
        const expected = vscode.Position.create(3, 0);
        assert.equal(actual.line, expected.line, 'lines must match');
        assert.equal(actual.character, expected.character, 'characters must match');
    });
    it('positionAt() should compute character', () => {
        const actual = astService_1.default.positionAt(`let a;\nlet b;`, 6 + os.EOL.length + 4);
        const expected = vscode.Position.create(1, 4);
        assert.equal(actual.line, expected.line, 'lines must match');
        assert.equal(actual.character, expected.character, 'characters must match');
    });
});
//# sourceMappingURL=astService.spec.js.map