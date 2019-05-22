"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const os = require("os");
const uuid_1 = require("uuid");
function getUserSecretsIdElement(csproj) {
    return getWithRegex(csproj.getText(), /<UserSecretsId>.*<\/UserSecretsId>/, 0);
}
exports.getUserSecretsIdElement = getUserSecretsIdElement;
function getIdFromElement(element) {
    return getWithRegex(element, /<UserSecretsId>([\w.-]+)<\/UserSecretsId>/, 1);
}
exports.getIdFromElement = getIdFromElement;
function getWithRegex(text, pattern, group) {
    const matches = text.match(pattern);
    if (!matches) {
        return;
    }
    return matches[group];
}
function insertUserSecretsIdElement(position, csproj) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = uuid_1.v4();
        let generatedElement;
        const linePrefix = getLinePrefix(csproj, position);
        if (isEmptyOrWhitespace(linePrefix)) {
            generatedElement = generateUserUserSecretsIdElement(id, false, linePrefix);
        }
        else {
            generatedElement = generateUserUserSecretsIdElement(id, true);
        }
        const edit = new vscode.WorkspaceEdit();
        edit.insert(csproj.uri, position, generatedElement);
        yield vscode.workspace.applyEdit(edit);
        yield csproj.save();
        return id;
    });
}
exports.insertUserSecretsIdElement = insertUserSecretsIdElement;
function getLinePrefix(document, position) {
    return document.lineAt(position).text.substr(0, position.character);
}
function isEmptyOrWhitespace(text) {
    return /^[ \t]*$/.test(text);
}
function generateUserUserSecretsIdElement(id, inline = false, indentation = '  ') {
    if (inline) {
        return `<UserSecretsId>${id}</UserSecretsId>`;
    }
    else {
        return `${indentation || '  '}<UserSecretsId>${id}</UserSecretsId>${os.EOL}${indentation}`;
    }
}
function getPropertyGroupClosingTagLinePosition(csproj) {
    for (let index = 0; index < csproj.lineCount; index++) {
        const line = csproj.lineAt(index);
        if (/<\/PropertyGroup>/.test(line.text)) {
            return new vscode.Position(index, line.text.indexOf('</PropertyGroup>'));
        }
    }
    return;
}
exports.getPropertyGroupClosingTagLinePosition = getPropertyGroupClosingTagLinePosition;
//# sourceMappingURL=csproj.js.map