"use strict";
/**
 * Developer: Stepan Burguchev
 * Date: 11/16/2017
 * Copyright: 2015-present ApprovalMax
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF ApprovalMax
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const _ = require("lodash");
const os = require("os");
const path = require("path");
const vscode = require("vscode-languageserver-types");
const astService_1 = require("../../src/services/astService");
const codeModService_1 = require("../../src/services/codeModService");
const Position_1 = require("../../src/utils/Position");
function toZeroBasedPosition(pos) {
    return vscode.Position.create(pos.line - 1, pos.column - 1);
}
function toOffsetFromStart(input, posOneBased) {
    const pos = toZeroBasedPosition(posOneBased);
    let offset = 0;
    const lines = input.split('\n');
    const prevLines = lines.slice(0, pos.line);
    offset += prevLines.map(l => l.length + os.EOL.length).reduce((s, a) => s + a, 0);
    offset += pos.character;
    return offset;
}
function getSelection(options) {
    return {
        anchor: toOffsetFromStart(options.input, options.anchor || options.active),
        active: toOffsetFromStart(options.input, options.active)
    };
}
function normalizeLineEndings(text) {
    return text.split('\r').join('');
}
function runInlineTransformTest(languageId, modId, input, output, options) {
    return __awaiter(this, void 0, void 0, function* () {
        input = normalizeLineEndings(input);
        const expectedOutput = normalizeLineEndings(output.source);
        codeModService_1.default.loadOneEmbeddedCodeMod(modId);
        const runOptions = {
            languageId,
            fileName: (options && options.fileName) || '/Users/billy/projects/example/codemods/example.ts',
            source: input,
            selection: getSelection({
                input,
                anchor: options.anchor,
                active: options.active
            }),
            include: [modId]
        };
        const canRun = (yield codeModService_1.default.getRunnableCodeMods(runOptions)).length === 1;
        if (!canRun) {
            throw new Error('The transform cannot be run at this position.');
        }
        let result = codeModService_1.default.executeTransform(modId, runOptions);
        const actualOutput = normalizeLineEndings(result.source);
        // Wrong result in execute()
        expect(actualOutput).toBe(expectedOutput);
        if (output.selection) {
            // execute() must return new selection
            expect(result.selection).toBeTruthy();
            const actualActivePos = Position_1.Position.fromZeroBased(astService_1.default.positionAt(result.source, result.selection.active));
            const actualAnchorPos = Position_1.Position.fromZeroBased(astService_1.default.positionAt(result.source, result.selection.anchor));
            const expectedActivePos = new Position_1.Position(output.selection.active.line, output.selection.active.column);
            const expectedAnchorPos = output.selection.anchor || expectedActivePos;
            // Wrong output selection
            expect(actualActivePos).toEqual(expectedActivePos);
            expect(actualAnchorPos).toEqual(expectedAnchorPos);
        }
    });
}
function runInlineCanRunTest(languageId, modId, input, expected, options) {
    return __awaiter(this, void 0, void 0, function* () {
        codeModService_1.default.loadOneEmbeddedCodeMod(modId);
        const runOptions = {
            languageId,
            fileName: (options && options.fileName) || '/Users/example/example.ts',
            source: input,
            selection: getSelection({
                input,
                anchor: options.anchor,
                active: options.active
            }),
            include: [modId]
        };
        const actualCanRun = (yield codeModService_1.default.getRunnableCodeMods(runOptions)).length === 1;
        // canRun test fail
        expect(actualCanRun).toBe(expected);
    });
}
function getLanguageIdByFileName(fileName) {
    const extensionMap = [
        {
            extensions: '.js,.es,.es6',
            parser: 'javascript'
        },
        {
            extensions: '.jsx',
            parser: 'javascriptreact'
        },
        {
            extensions: '.ts',
            parser: 'typescript'
        },
        {
            extensions: '.tsx',
            parser: 'typescriptreact'
        }
    ];
    const fileExt = path.extname(fileName);
    const def = extensionMap.find(x => x.extensions.split(',').indexOf(fileExt) !== -1);
    if (!def) {
        throw new Error(`Failed to match file extension of file '${fileName}' to languageId.`);
    }
    return def.parser;
}
function extractPosition(modId, source) {
    const re = /\/\*#\s*([^#]+?)\s*#\*\//g;
    const reClean = /\s*\/\*#\s*([^#]+?)\s*#\*\//g;
    const match = re.exec(source);
    if (!match || !match[0]) {
        return null;
    }
    // tslint:disable-next-line:no-eval
    const posDef = eval('(' + match[1] + ')');
    if (!Number.isFinite(posDef.pos)) {
        throw new Error(`Invalid 'pos' definition in positional comment:\n"${source}"`);
    }
    const column = posDef.pos;
    let line = source.split('\n').findIndex(l => l.includes(match[0])) + 1;
    if (posDef.nextLine) {
        line++;
    }
    let cleanSource = source.replace(reClean, '');
    if (cleanSource.startsWith('\n')) {
        cleanSource = cleanSource.substring(1);
        line--;
    }
    return {
        source: cleanSource,
        line,
        column
    };
}
function extractFixtures(modId, input, fallbackFixtureName = null, hasPosition = true) {
    const re = /\/\*\$\s*([^\$]+?)\s*\$\*\//g; // /*$ VALUE $*/
    let match;
    const fixtures = [];
    let activeFixture;
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = re.exec(input)) !== null) {
        let fixtureDef;
        try {
            // tslint:disable-next-line:no-eval
            fixtureDef = eval('(' + match[1] + ')');
        }
        catch (e) {
            throw new Error(`[${modId}] Failed to parse inline fixture definition.`);
        }
        if (activeFixture) {
            activeFixture.inputEnd = re.lastIndex - match[0].length;
            fixtures.push(activeFixture);
        }
        activeFixture = {
            raw: fixtureDef,
            name: fixtureDef.fixture,
            skip: fixtureDef.skip,
            validateOutPos: fixtureDef.validateOutPos,
            inputStart: re.lastIndex,
            inputEnd: input.length
        };
    }
    if (activeFixture) {
        fixtures.push(activeFixture);
    }
    const fullFixtures = fixtures.map(fx => {
        const inputFragment = input.substring(fx.inputStart, fx.inputEnd);
        let source = inputFragment.trim();
        let pos = extractPosition(modId, source);
        if (pos) {
            source = pos.source;
        }
        if (!pos && (hasPosition || fx.validateOutPos)) {
            throw new Error(`[${modId}][${fx.name ||
                ''}] Position is not provided, use '/*# { position: columnNumber[, nextLine: true] } #*/'`);
        }
        return {
            raw: fx.raw,
            name: fx.name,
            validateOutPos: Boolean(fx.validateOutPos),
            skip: fx.skip || false,
            source,
            pos: pos || new Position_1.Position(1, 1)
        };
    });
    if (fullFixtures.length === 0) {
        let source = input.trim();
        let pos = extractPosition(modId, source);
        if (pos) {
            source = pos.source;
        }
        if (!pos && hasPosition) {
            throw new Error(`[${modId}][${fallbackFixtureName}] Position is not provided, use '/*# { position: columnNumber[, nextLine: true] } #*/'`);
        }
        fullFixtures.push({
            raw: {},
            name: fallbackFixtureName,
            validateOutPos: false,
            skip: false,
            source,
            pos: pos || new Position_1.Position(1, 1)
        });
    }
    return fullFixtures;
}
function defineTransformTests(dirName, modId, fixtureId = null, options = {}) {
    const fixDir = path.join(dirName, '__codemod-fixtures__');
    const fixtureSuffix = fixtureId ? `.${fixtureId}` : '';
    const files = fs.readdirSync(fixDir);
    const inputFile = files.find(file => file.startsWith(`${modId}${fixtureSuffix}.input.`));
    const outputFile = files.find(file => file.startsWith(`${modId}${fixtureSuffix}.output.`));
    if (!inputFile || !outputFile) {
        throw new Error(`Failed to find input or output fixture. modId: '${modId}', fixtureId: ${fixtureId}.`);
    }
    const input = fs.readFileSync(path.join(fixDir, inputFile), 'utf8');
    const output = fs.readFileSync(path.join(fixDir, outputFile), 'utf8');
    const inputFixtures = extractFixtures(modId, input, fixtureId, true);
    const outputFixtures = extractFixtures(modId, output, fixtureId, false);
    describe(`${modId} transform`, () => {
        inputFixtures.forEach(fx => {
            const testName = fx.name
                ? `"${modId}:${fx.name}" transforms correctly (pos ${fx.pos.line}:${fx.pos.column})`
                : `"${modId}" transforms correctly (pos ${fx.pos.line}:${fx.pos.column})`;
            const outputFx = outputFixtures.find(x => x.name === fx.name);
            if (!outputFx) {
                throw new Error(`Failed to find output data for fixture ${fx.name}, mod ${modId}.`);
            }
            const fn = fx.skip ? it.skip : it;
            fn(testName, () => __awaiter(this, void 0, void 0, function* () {
                yield runInlineTransformTest(getLanguageIdByFileName(inputFile), modId, fx.source, {
                    source: outputFx.source,
                    selection: outputFx.validateOutPos
                        ? {
                            active: outputFx.pos
                        }
                        : undefined
                }, {
                    fileName: options.fileName,
                    active: fx.pos
                });
            }));
        });
    });
}
function defineCanRunTests(dirName, modId, fixtureId = null, options = {}) {
    const fixDir = path.join(dirName, '__codemod-fixtures__');
    const fixtureSuffix = fixtureId ? `.${fixtureId}` : '';
    const files = fs.readdirSync(fixDir);
    const inputFile = files.find(file => file.startsWith(`${modId}${fixtureSuffix}.check.`));
    if (!inputFile) {
        throw new Error(`Failed to find the input fixture for canRun() test. modId: '${modId}', fixtureId: ${fixtureId}.`);
    }
    const input = fs.readFileSync(path.join(fixDir, inputFile), 'utf8');
    const inputFixtures = extractFixtures(modId, input, fixtureId, true);
    describe(`${modId} can run`, () => {
        inputFixtures.forEach(fx => {
            if (typeof fx.raw.expected !== 'boolean') {
                throw new Error(`Invalid type of 'expected' property in fixture ${fx.name}, mod ${modId}.`);
            }
            const expected = fx.raw.expected;
            const testName = fx.name
                ? `"${modId}:${fx.name}" ${expected ? 'can' : 'cannot'} run (pos ${fx.pos.line}:${fx.pos.column})`
                : `"${modId}" ${expected ? 'can' : 'cannot'} run (pos ${fx.pos.line}:${fx.pos.column})`;
            const fn = fx.skip ? it.skip : it;
            fn(testName, () => __awaiter(this, void 0, void 0, function* () {
                yield runInlineCanRunTest(getLanguageIdByFileName(inputFile), modId, fx.source, expected, {
                    fileName: options.fileName,
                    active: fx.pos
                });
            }));
        });
    });
}
function defineCodeModTests(dirName) {
    const fixDir = path.join(dirName, '__codemod-fixtures__');
    const files = fs.readdirSync(fixDir);
    const modIds = _.uniq(files.map(f => f.substring(0, f.indexOf('.'))));
    modIds.forEach(modId => {
        defineCanRunTests(dirName, modId);
        defineTransformTests(dirName, modId);
    });
}
exports.defineCodeModTests = defineCodeModTests;
//# sourceMappingURL=codeModHelpers.js.map