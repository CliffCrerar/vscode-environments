"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const os = require("os");
const astService_1 = require("../../src/services/astService");
const smartSelectionService_1 = require("../../src/services/smartSelectionService");
function normalizeNewLines(code) {
    return code.replace(/\r?\n/g, os.EOL);
}
exports.normalizeNewLines = normalizeNewLines;
function extractSelections(code) {
    code = normalizeNewLines(code);
    const re = /\|(?:(\d+)\|)?/g;
    let adjustedIndex = 0;
    const selections = {};
    let match;
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = re.exec(code)) !== null) {
        const fragment = match[0];
        const selectionId = match[1] || 'single';
        let selInfo = selections[selectionId];
        if (!selInfo) {
            selInfo = selections[selectionId] = {};
        }
        if (!Number.isFinite(selInfo.anchor)) {
            selInfo.anchor = match.index - adjustedIndex;
        }
        else {
            selInfo.active = match.index - adjustedIndex;
        }
        adjustedIndex += fragment.length;
    }
    return Object.values(selections);
}
exports.extractSelections = extractSelections;
function removeSelectionMarkers(code) {
    return code.replace(/\|(?:(\d+)\|)?/g, '');
}
exports.removeSelectionMarkers = removeSelectionMarkers;
function applySelectionMarkers(code, selections) {
    code = normalizeNewLines(code);
    const points = {};
    selections
        .slice(0)
        .sort((a, b) => {
        return a.active - b.active;
    })
        .forEach((sel, i) => {
        [sel.anchor, sel.active].forEach(point => {
            let a = points[point];
            if (!a) {
                a = points[point] = {
                    indexes: []
                };
            }
            if (!a.indexes.includes(i)) {
                a.indexes.push(i);
            }
        });
    });
    Object.keys(points)
        .sort((a, b) => Number(b) - Number(a))
        .forEach(key => {
        const offset = Number(key);
        const point = points[offset];
        code = [
            code.substring(0, offset),
            ...point.indexes.map(i => (selections.length === 1 ? '|' : `|${i + 1}|`)),
            code.substring(offset)
        ].join('');
    });
    return code;
}
exports.applySelectionMarkers = applySelectionMarkers;
/**
 * Extracts /*# { action: '+/-' } #*\/ comment to determine smart action. Defaults to EXTEND if not found.
 */
function extractAction(text) {
    const re = /\/\*#\s*([^#]+?)\s*#\*\//g;
    const reClean = /\s*\/\*#\s*([^#]+?)\s*#\*\//g;
    const match = re.exec(text);
    if (!match || !match[0]) {
        return {
            text,
            action: true
        };
    }
    // tslint:disable-next-line:no-eval
    const posDef = eval('(' + match[1] + ')');
    const action = posDef.action;
    const cleanSource = text.replace(reClean, '');
    return {
        text: cleanSource,
        action: action !== '-'
    };
}
function assertSmartSelection(inputFixture, outputFixture, languageId = 'javascriptreact') {
    const extractedData1 = extractAction(inputFixture);
    const extractedData2 = extractAction(outputFixture);
    inputFixture = normalizeNewLines(extractedData1.text.trim());
    outputFixture = normalizeNewLines(extractedData2.text.trim());
    const inputSelections = extractSelections(inputFixture);
    const expectedSelections = extractSelections(outputFixture);
    const cleanInputFixture = removeSelectionMarkers(inputFixture);
    const cleanOutputFixture = removeSelectionMarkers(outputFixture);
    assert.equal(cleanOutputFixture, cleanInputFixture, 'Source code in input and output fixtures must be the same.');
    const ast = astService_1.default.getAstTree({
        languageId,
        fileName: 'example.jsx',
        source: cleanInputFixture
    });
    if (!ast) {
        throw new Error('SyntaxError in input fixture.');
    }
    let actualSelections;
    if (extractedData1.action) {
        actualSelections = smartSelectionService_1.default.extendSelection({
            languageId,
            source: cleanInputFixture,
            fileName: 'example.js',
            ast,
            selections: inputSelections
        });
    }
    else {
        actualSelections = smartSelectionService_1.default.shrinkSelection({
            languageId,
            source: cleanInputFixture,
            fileName: 'example.js',
            ast,
            selections: inputSelections
        });
    }
    const actualOutputFixture = applySelectionMarkers(cleanInputFixture, actualSelections);
    assert.equal(actualOutputFixture, outputFixture, `Input fixture: ${inputFixture}`);
}
exports.assertSmartSelection = assertSmartSelection;
function assertSmartSelectionBulk(fixtures, languageId = 'javascriptreact') {
    for (let i = 0; i < fixtures.length - 1; i++) {
        const input = fixtures[i];
        const output = fixtures[i + 1];
        assertSmartSelection(input, output, languageId);
    }
}
exports.assertSmartSelectionBulk = assertSmartSelectionBulk;
//# sourceMappingURL=smartSelectionHelpers.js.map