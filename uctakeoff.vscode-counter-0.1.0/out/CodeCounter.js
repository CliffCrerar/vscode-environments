'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const LineCounter_1 = require("./LineCounter");
const Gitignore_1 = require("./Gitignore");
const JSONC = require("jsonc-parser");
const EXTENSION_NAME = 'VSCodeCounter';
const CONFIGURATION_SECTION = 'VSCodeCounter';
const toZeroPadString = (num, fig) => num.toString().padStart(fig, '0');
const dateToString = (date) => `${date.getFullYear()}-${toZeroPadString(date.getMonth() + 1, 2)}-${toZeroPadString(date.getDate(), 2)}`
    + ` ${toZeroPadString(date.getHours(), 2)}:${toZeroPadString(date.getMinutes(), 2)}:${toZeroPadString(date.getSeconds(), 2)}`;
const toStringWithCommas = (obj) => {
    if (typeof obj === 'number') {
        return new Intl.NumberFormat('en-US').format(obj);
    }
    else {
        return obj.toString();
    }
};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(`${EXTENSION_NAME}: now active!`);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const codeCountController = new CodeCounterController();
    context.subscriptions.push(codeCountController, vscode.commands.registerCommand('extension.vscode-counter.countInWorkspace', () => codeCountController.countInWorkspace()), vscode.commands.registerCommand('extension.vscode-counter.countInDirectory', (targetDir) => codeCountController.countInDirectory(targetDir)), vscode.commands.registerCommand('extension.vscode-counter.countInFile', () => codeCountController.toggleVisible()));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class CodeCounterController {
    constructor() {
        this.configuration = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
        this.codeCounter_ = null;
        // subscribe to selection change and editor activation events
        let subscriptions = [];
        vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this, subscriptions);
        vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this, subscriptions);
        vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = vscode.Disposable.from(...subscriptions);
        if (this.isVisible) {
            this.codeCounter.countCurrentFile();
        }
    }
    dispose() {
        this.disposable.dispose();
        this.disposeCodeCounter();
    }
    get codeCounter() {
        if (this.codeCounter_ === null) {
            console.log(`${EXTENSION_NAME}: create CodeCounter`);
            this.codeCounter_ = new CodeCounter(this.configuration);
        }
        return this.codeCounter_;
    }
    disposeCodeCounter() {
        if (this.codeCounter_ !== null) {
            this.codeCounter_.dispose();
            this.codeCounter_ = null;
            console.log(`${EXTENSION_NAME}: dispose CodeCounter`);
        }
    }
    get isVisible() {
        return this.configuration.get('showInStatusBar', false);
    }
    toggleVisible() {
        this.configuration.update('showInStatusBar', !this.isVisible);
    }
    countInDirectory(targetDir) {
        const dir = vscode.workspace.rootPath;
        if (targetDir !== undefined) {
            this.codeCounter.countLinesInDirectory(targetDir.fsPath);
        }
        else {
            const option = {
                value: dir || "",
                placeHolder: "Input Directory Path",
                prompt: "Input Directory Path. "
            };
            vscode.window.showInputBox(option).then(dirPath => {
                if (dirPath !== undefined) {
                    this.codeCounter.countLinesInDirectory(dirPath);
                }
            });
        }
    }
    countInWorkspace() {
        const dir = vscode.workspace.rootPath;
        if (dir !== undefined) {
            this.codeCounter.countLinesInDirectory(dir);
        }
        else {
            vscode.window.showErrorMessage(`${EXTENSION_NAME}: No open workspace`);
        }
    }
    onDidChangeActiveTextEditor() {
        if (this.codeCounter_ !== null) {
            console.log(`${EXTENSION_NAME}: onDidChangeActiveTextEditor()`);
            this.codeCounter.countCurrentFile();
        }
    }
    onDidChangeTextDocument() {
        if (this.codeCounter_ !== null) {
            console.log(`${EXTENSION_NAME}: onDidChangeTextDocument()`);
            this.codeCounter.countCurrentFile();
        }
    }
    onDidChangeConfiguration() {
        const newConf = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
        if (JSON.stringify(this.configuration) !== JSON.stringify(newConf)) {
            console.log(`${EXTENSION_NAME}: onDidChangeConfiguration()`);
            this.configuration = newConf;
            this.disposeCodeCounter();
            if (this.isVisible) {
                this.codeCounter.countCurrentFile();
            }
        }
    }
}
class CodeCounter {
    constructor(configuration) {
        this.outputChannel = null;
        this.statusBarItem = null;
        this.configuration = configuration;
        this.lineCounterTable = new LineCounterTable(this.configuration);
        if (this.getConf('showInStatusBar', false)) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }
    }
    dispose() {
        if (this.statusBarItem !== null) {
            this.statusBarItem.dispose();
        }
        if (this.outputChannel !== null) {
            this.outputChannel.dispose();
        }
    }
    getConf(section, defaultValue) {
        return this.configuration.get(section, defaultValue);
    }
    toOutputChannel(text) {
        if (this.outputChannel === null) {
            this.outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
        }
        this.outputChannel.show();
        this.outputChannel.appendLine(text);
    }
    countLinesInDirectory(dir) {
        console.log(`${EXTENSION_NAME}: countLinesInDirectory : ${dir}`);
        const confFiles = vscode.workspace.getConfiguration("files");
        const workspaceDir = vscode.workspace.rootPath || `.${path.sep}`;
        const outputDir = path.resolve(workspaceDir, this.getConf('outputDirectory', ''));
        const ignoreUnsupportedFile = this.getConf('ignoreUnsupportedFile', true);
        const includes = this.getConf('include', ['**/*']);
        const excludes = this.getConf('exclude', []);
        excludes.push(outputDir);
        if (this.getConf('useFilesExclude', true)) {
            excludes.push(...Object.keys(confFiles.get('exclude', {})));
        }
        excludes.push('.gitignore');
        const encoding = confFiles.get('encoding', 'utf8');
        const endOfLine = confFiles.get('eol', '\n');
        console.log(`${EXTENSION_NAME}: includes : ${includes.join(',')}`);
        console.log(`${EXTENSION_NAME}: excludes : ${excludes.join(',')}`);
        vscode.workspace.findFiles(`{${includes.join(',')}}`, `{${excludes.join(',')}}`).then((files) => {
            new Promise((resolve, reject) => {
                const filePathes = files.map(uri => uri.fsPath).filter(p => !path.relative(dir, p).startsWith('..'));
                console.log(`${EXTENSION_NAME}: target : ${filePathes.length} files`);
                if (this.getConf('useGitignore', true)) {
                    vscode.workspace.findFiles('**/.gitignore', '').then((gitignoreFiles) => {
                        gitignoreFiles.forEach(f => console.log(`${EXTENSION_NAME}: use gitignore : ${f.fsPath}`));
                        const gitignores = new Gitignore_1.default('').merge(...gitignoreFiles.map(uri => uri.fsPath).sort().map(p => new Gitignore_1.default(fs.readFileSync(p, 'utf8'), path.dirname(p))));
                        resolve(filePathes.filter(p => gitignores.excludes(p)));
                    });
                }
                else {
                    resolve(filePathes);
                }
            }).then((filePathes) => {
                console.log(`${EXTENSION_NAME}: target : ${filePathes.length} files`);
                return new Promise((resolve, reject) => {
                    const results = new ResultTable(dir, this.getConf('printNumberWithCommas', true) ? toStringWithCommas : (obj) => obj.toString());
                    if (filePathes.length <= 0) {
                        resolve(results);
                    }
                    let fileCount = 0;
                    filePathes.forEach(filepath => {
                        const lineCounter = this.lineCounterTable.getByPath(filepath);
                        if (lineCounter !== undefined) {
                            fs.readFile(filepath, encoding, (err, data) => {
                                ++fileCount;
                                if (err) {
                                    this.toOutputChannel(`"${filepath}" Read Error : ${err.message}.`);
                                    results.appendEmpty(filepath, '(Read Error)');
                                }
                                else {
                                    results.appendResult(filepath, lineCounter.name, lineCounter.count(data));
                                }
                                if (fileCount === filePathes.length) {
                                    resolve(results);
                                }
                            });
                        }
                        else {
                            if (!ignoreUnsupportedFile) {
                                results.appendEmpty(filepath, '(Unsupported)');
                            }
                            ++fileCount;
                            if (fileCount === filePathes.length) {
                                resolve(results);
                            }
                        }
                    });
                });
            }).then((results) => {
                console.log(`${EXTENSION_NAME}: count ${results.length} files`);
                if (results.length <= 0) {
                    vscode.window.showErrorMessage(`${EXTENSION_NAME}: There was no target file.`);
                    return;
                }
                const previewType = this.getConf('outputPreviewType', '');
                console.log(`${EXTENSION_NAME}: OutputDir : ${outputDir}`);
                makeDirectories(outputDir);
                if (this.getConf('outputAsText', true)) {
                    const promise = writeTextFile(path.join(outputDir, 'results.txt'), results.toTextLines().join(endOfLine));
                    if (previewType === 'text') {
                        promise.then(ofilename => showTextFile(ofilename)).catch(err => console.error(err));
                    }
                    else {
                        promise.catch(err => console.error(err));
                    }
                }
                if (this.getConf('outputAsCSV', true)) {
                    const promise = writeTextFile(path.join(outputDir, 'results.csv'), results.toCSVLines().join(endOfLine));
                    if (previewType === 'csv') {
                        promise.then(ofilename => showTextFile(ofilename)).catch(err => console.error(err));
                    }
                    else {
                        promise.catch(err => console.error(err));
                    }
                }
                if (this.getConf('outputAsMarkdown', true)) {
                    const promise = writeTextFile(path.join(outputDir, 'results.md'), results.toMarkdownLines().join(endOfLine));
                    if (previewType === 'markdown') {
                        promise.then(ofilename => vscode.commands.executeCommand("markdown.showPreview", vscode.Uri.file(ofilename)))
                            .catch(err => console.error(err));
                    }
                    else {
                        promise.catch(err => console.error(err));
                    }
                }
            }).catch((reason) => {
                vscode.window.showErrorMessage(`${EXTENSION_NAME}: Error has occurred.`, reason);
            });
        });
    }
    countCurrentFile_() {
        // Get the current text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return `${EXTENSION_NAME}:Unsupported`;
        }
        const doc = editor.document;
        const lineCounter = this.lineCounterTable.getByName(doc.languageId) || this.lineCounterTable.getByPath(doc.uri.fsPath);
        console.log(`${path.basename(doc.uri.fsPath)}: ${JSON.stringify(lineCounter)}`);
        if (lineCounter !== undefined) {
            const result = lineCounter.count(doc.getText());
            // return `Code:${result.code} Comment:${result.comment} Blank:${result.blank} Total:${result.code+result.comment+result.blank}`;
            return `Code:${result.code} Comment:${result.comment} Blank:${result.blank}`;
        }
        else {
            return `${EXTENSION_NAME}:Unsupported`;
        }
    }
    countCurrentFile() {
        if (this.statusBarItem !== null) {
            this.statusBarItem.show();
            this.statusBarItem.text = this.countCurrentFile_();
        }
    }
}
class LineCounterTable {
    constructor(conf) {
        this.langIdTable = new Map();
        this.aliasTable = new Map();
        this.fileextRules = new Map();
        this.filenameRules = new Map();
        const confJsonTable = new Map();
        vscode.extensions.all.forEach(ex => {
            // console.log(JSON.stringify(ex.packageJSON));
            const contributes = ex.packageJSON.contributes;
            if (contributes !== undefined) {
                const languages = contributes.languages;
                if (languages !== undefined) {
                    languages.forEach((lang) => {
                        const lineCounter = getOrSetFirst(this.langIdTable, lang.id, () => new LineCounter_1.default(lang.id));
                        lineCounter.addAlias(lang.aliases);
                        if (lang.aliases !== undefined && lang.aliases.length > 0) {
                            lang.aliases.forEach((alias) => {
                                this.aliasTable.set(alias, lineCounter);
                            });
                        }
                        const confpath = lang.configuration ? path.join(ex.extensionPath, lang.configuration) : "";
                        if (confpath.length > 0) {
                            // console.log(`language conf file: ${confpath}`);
                            const v = getOrSetFirst(confJsonTable, confpath, () => JSONC.parse(fs.readFileSync(confpath, "utf8")));
                            lineCounter.addCommentRule(v.comments);
                        }
                        if (lang.extensions !== undefined) {
                            lang.extensions.forEach(ex => this.fileextRules.set(ex, lineCounter));
                        }
                        if (lang.filenames !== undefined) {
                            lang.filenames.forEach(ex => this.filenameRules.set(ex, lineCounter));
                        }
                    });
                }
            }
        });
        class BlockPattern {
            constructor() {
                this.types = [];
                this.patterns = [];
            }
        }
        conf.get('blockComment', []).forEach(patterns => {
            patterns.types.forEach(t => {
                this.addBlockStringRule(t, ...patterns.patterns.map(pat => { return { begin: pat[0], end: pat[1] }; }));
            });
        });
        // console.log(`confJsonTable : ${confJsonTable.size}  =======================================================================`);
        // confJsonTable.forEach((v, n) => { console.log(`${n}:\n ${JSON.stringify(v)}`); });
        // console.log(`this.filenameRules : ${this.filenameRules.size}  =======================================================================`);
        // this.filenameRules.forEach((v, n) => { console.log(`${n}\t ${JSON.stringify(v)}`); });
        // console.log(`this.fileextRules : ${this.fileextRules.size}  =======================================================================`);
        // this.fileextRules.forEach((v, n) => { console.log(`${n}\t ${JSON.stringify(v)}`); });
        // console.log(`this.langIdTable : ${this.langIdTable.size}  =======================================================================`);
        // this.langIdTable.forEach((v, n) => { console.log(`${n}\t ${JSON.stringify(v)}`); });
        // console.log(`this.aliasTable : ${this.aliasTable.size}  =======================================================================`);
        // this.aliasTable.forEach((v, n) => { console.log(`${n}\t ${JSON.stringify(v)}`); });
    }
    getByName(langName) {
        return this.langIdTable.get(langName) || this.aliasTable.get(langName);
    }
    getByPath(filePath) {
        return this.fileextRules.get(filePath) || this.fileextRules.get(path.extname(filePath)) || this.filenameRules.get(path.basename(filePath));
    }
    addBlockStringRule(id, ...tokenPairs) {
        const lineCounter = this.getByName(id) || this.getByPath(id);
        if (lineCounter) {
            // console.log(`addBlockStringRule("${id}",  ${tokenPairs.map(t => t.begin + t.end).join('|')}) => [${lineCounter.name}]`);
            lineCounter.addBlockStringRule(...tokenPairs);
        }
    }
}
class Result {
    constructor(filename, language, errorMessage = '') {
        this.code = 0;
        this.comment = 0;
        this.blank = 0;
        this.filename = filename;
        this.language = language;
        this.errorMessage = errorMessage;
    }
    get total() {
        return this.code + this.comment + this.blank;
    }
    append(value) {
        this.code += value.code;
        this.comment += value.comment;
        this.blank += value.blank;
        return this;
    }
}
class Statistics {
    constructor(name) {
        this.files = 0;
        this.code = 0;
        this.comment = 0;
        this.blank = 0;
        this.name = name;
    }
    get total() {
        return this.code + this.comment + this.blank;
    }
    append(value) {
        this.files++;
        this.code += value.code;
        this.comment += value.comment;
        this.blank += value.blank;
        return this;
    }
}
class ResultTable {
    constructor(dirpath, valueToString = (obj) => obj.toString()) {
        this.fileResults = [];
        this.dirResultTable = new Map();
        this.langResultTable = new Map();
        this.total = new Statistics('Total');
        this.targetDirPath = dirpath;
        this.valueToString = valueToString;
    }
    get length() {
        return this.fileResults.length;
    }
    appendResult(filepath, language, value) {
        const result = new Result(path.relative(this.targetDirPath, filepath), language).append(value);
        this.fileResults.push(result);
        let parent = path.dirname(result.filename);
        while (parent.length > 0) {
            getOrSetFirst(this.dirResultTable, parent, () => new Statistics(parent)).append(value);
            const p = path.dirname(parent);
            if (p === parent) {
                break;
            }
            parent = p;
        }
        getOrSetFirst(this.langResultTable, language, () => new Statistics(language)).append(value);
        this.total.append(value);
    }
    appendError(filepath, language, err) {
        this.fileResults.push(new Result(path.relative(this.targetDirPath, filepath), language, 'Error:' + err.message));
    }
    appendEmpty(filepath, language) {
        this.fileResults.push(new Result(path.relative(this.targetDirPath, filepath), language));
    }
    toCSVLines() {
        const languages = [...this.langResultTable.keys()];
        return [
            `filename, language, ${languages.join(', ')}, comment, blank, total`,
            ...this.fileResults.sort((a, b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => `${v.filename}, ${v.language}, ${languages.map(l => l === v.language ? v.code : 0).join(', ')}, ${v.comment}, ${v.blank}, ${v.total}`),
            `Total, -, ${[...this.langResultTable.values()].map(r => r.code).join(', ')}, ${this.total.comment}, ${this.total.blank}, ${this.total.total}`
        ];
    }
    toTextLines() {
        const valueToString = this.valueToString;
        class Formatter {
            constructor(...columnInfo) {
                this.columnInfo = columnInfo;
                for (const info of this.columnInfo) {
                    info.width = Math.max(info.title.length, info.width);
                }
            }
            get lineSeparator() {
                return '+-' + this.columnInfo.map(i => '-'.repeat(i.width)).join('-+-') + '-+';
            }
            get headerLines() {
                return [this.lineSeparator, '| ' + this.columnInfo.map(i => i.title.padEnd(i.width)).join(' | ') + ' |', this.lineSeparator];
            }
            get footerLines() {
                return [this.lineSeparator];
            }
            line(...data) {
                return '| ' + data.map((d, i) => {
                    if (typeof d === 'string') {
                        return d.padEnd(this.columnInfo[i].width);
                    }
                    else {
                        return valueToString(d).padStart(this.columnInfo[i].width);
                    }
                }).join(' | ') + ' |';
            }
        }
        const maxNamelen = Math.max(...this.fileResults.map(res => res.filename.length));
        const maxLanglen = Math.max(...[...this.langResultTable.keys()].map(l => l.length));
        const resultFormat = new Formatter({ title: 'filename', width: maxNamelen }, { title: 'language', width: maxLanglen }, { title: 'code', width: 10 }, { title: 'comment', width: 10 }, { title: 'blank', width: 10 }, { title: 'total', width: 10 });
        const dirFormat = new Formatter({ title: 'path', width: maxNamelen }, { title: 'files', width: 10 }, { title: 'code', width: 10 }, { title: 'comment', width: 10 }, { title: 'blank', width: 10 }, { title: 'total', width: 10 });
        const langFormat = new Formatter({ title: 'language', width: maxLanglen }, { title: 'files', width: 10 }, { title: 'code', width: 10 }, { title: 'comment', width: 10 }, { title: 'blank', width: 10 }, { title: 'total', width: 10 });
        return [
            // '='.repeat(resultFormat.headerLines[0].length),
            // EXTENSION_NAME,
            `Directory : ${this.targetDirPath}`,
            `Date : ${dateToString(new Date())}`,
            // `Total : code: ${this.total.code}, comment : ${this.total.comment}, blank : ${this.total.blank}, all ${this.total.total} lines`,
            `Total : ${this.total.files} files,  ${this.total.code} codes, ${this.total.comment} comments, ${this.total.blank} blanks, all ${this.total.total} lines`,
            '',
            'Languages',
            ...langFormat.headerLines,
            ...[...this.langResultTable.values()].sort((a, b) => b.code - a.code)
                .map(v => langFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            ...langFormat.footerLines,
            '',
            'Directories',
            ...dirFormat.headerLines,
            ...[...this.dirResultTable.values()].sort((a, b) => b.code - a.code)
                .map(v => dirFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            ...dirFormat.footerLines,
            '',
            'Files',
            ...resultFormat.headerLines,
            ...this.fileResults.sort((a, b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => resultFormat.line(v.filename, v.language, v.code, v.comment, v.blank, v.total)),
            resultFormat.line('Total', '', this.total.code, this.total.comment, this.total.blank, this.total.total),
            ...resultFormat.footerLines,
        ];
    }
    toMarkdownLines() {
        const dir = this.targetDirPath;
        const valueToString = this.valueToString;
        class MarkdownFormatter {
            constructor(...columnInfo) {
                this.columnInfo = columnInfo;
            }
            get lineSeparator() {
                return '| ' + this.columnInfo.map(i => (i.format === 'number') ? '---:' : ':---').join(' | ') + ' |';
            }
            get headerLines() {
                return ['| ' + this.columnInfo.map(i => i.title).join(' | ') + ' |', this.lineSeparator];
            }
            line(...data) {
                return '| ' + data.map((d, i) => (typeof d !== 'string') ? valueToString(d) : (this.columnInfo[i].format === 'uri') ? `[${d}](${vscode.Uri.file(path.join(dir, d))})` : d).join(' | ') + ' |';
            }
        }
        const resultFormat = new MarkdownFormatter({ title: 'filename', format: 'uri' }, { title: 'language', format: 'string' }, { title: 'code', format: 'number' }, { title: 'comment', format: 'number' }, { title: 'blank', format: 'number' }, { title: 'total', format: 'number' });
        const dirFormat = new MarkdownFormatter({ title: 'path', format: 'string' }, { title: 'files', format: 'number' }, { title: 'code', format: 'number' }, { title: 'comment', format: 'number' }, { title: 'blank', format: 'number' }, { title: 'total', format: 'number' });
        const langFormat = new MarkdownFormatter({ title: 'language', format: 'string' }, { title: 'files', format: 'number' }, { title: 'code', format: 'number' }, { title: 'comment', format: 'number' }, { title: 'blank', format: 'number' }, { title: 'total', format: 'number' });
        return [
            `# ${dir}`,
            '',
            `Date : ${dateToString(new Date())}`,
            '',
            `Total : ${this.total.files} files,  ${this.total.code} codes, ${this.total.comment} comments, ${this.total.blank} blanks, all ${this.total.total} lines`,
            '',
            '## Languages',
            ...langFormat.headerLines,
            ...[...this.langResultTable.values()].sort((a, b) => b.code - a.code)
                .map(v => langFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            '',
            '## Directories',
            ...dirFormat.headerLines,
            // ...[...dirResultTable.values()].sort((a,b) => b.code - a.code)
            ...[...this.dirResultTable.values()].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
                .map(v => dirFormat.line(v.name, v.files, v.code, v.comment, v.blank, v.total)),
            '',
            '## Files',
            ...resultFormat.headerLines,
            ...this.fileResults.sort((a, b) => a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0)
                .map(v => resultFormat.line(v.filename, v.language, v.code, v.comment, v.blank, v.total)),
        ];
    }
}
function getOrSetFirst(map, key, otherwise) {
    let v = map.get(key);
    if (v === undefined) {
        v = otherwise();
        map.set(key, v);
    }
    return v;
}
function makeDirectories(dirpath) {
    if (fs.existsSync(dirpath)) {
        return true;
    }
    const parent = path.dirname(dirpath);
    if ((parent !== dirpath) && makeDirectories(parent)) {
        fs.mkdirSync(dirpath);
        return true;
    }
    else {
        return false;
    }
}
function showTextFile(outputFilename) {
    console.log(`${EXTENSION_NAME}: showTextFile : ${outputFilename}`);
    return new Promise((resolve, reject) => {
        vscode.workspace.openTextDocument(outputFilename)
            .then((doc) => {
            return vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true);
        }, err => {
            reject(err);
        }).then((editor) => {
            resolve(editor);
        }, err => {
            reject(err);
        });
    });
}
function writeTextFile(outputFilename, text) {
    console.log(`${EXTENSION_NAME}: writeTextFile : ${outputFilename} ${text.length}B`);
    return new Promise((resolve, reject) => {
        fs.writeFile(outputFilename, text, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve(outputFilename);
            }
        });
    });
}
//# sourceMappingURL=CodeCounter.js.map