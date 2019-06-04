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
const fs = require("mz/fs");
const path = require("path");
const etree = require('@azz/elementtree');
const stripBom = require('strip-bom');
class NoVsprojError extends Error {
}
exports.NoVsprojError = NoVsprojError;
let _cacheXml = Object.create(null);
function getProjPath(fileDir, projectFileExtension, rootPaths, walkUp = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!path.isAbsolute(fileDir))
            fileDir = path.resolve(fileDir);
        const files = yield fs.readdir(fileDir);
        const vsproj = files.find((file) => file.endsWith(`.${projectFileExtension}`));
        if (vsproj)
            return path.resolve(fileDir, vsproj);
        if (walkUp) {
            const parent = path.resolve(fileDir, '..');
            if (rootPaths.indexOf(parent) >= 0 || parent === fileDir) {
                throw new NoVsprojError(`Reached fs root, no ${projectFileExtension} found`);
            }
            return getProjPath(parent, projectFileExtension, rootPaths);
        }
        throw new NoVsprojError(`No ${projectFileExtension} found in current directory: ${fileDir}`);
    });
}
exports.getProjPath = getProjPath;
function hasFile(vsproj, filePath) {
    const filePathRel = relativeTo(vsproj, filePath);
    const project = vsproj.xml.getroot();
    const match = project.find(`./ItemGroup/*[@Include='${filePathRel}']`);
    return !!match;
}
exports.hasFile = hasFile;
function relativeTo(vsproj, filePath, addFinalSlashToFolders = false) {
    let relativePath = path.relative(path.dirname(vsproj.fsPath), filePath)
        .replace(/\//g, '\\'); // use Windows style paths for consistency
    if (addFinalSlashToFolders && path.extname(filePath) === '') {
        const fileName = path.basename(filePath);
        if (!fileName.startsWith(".")) {
            //Add final \ for directories
            relativePath += "\\";
        }
    }
    return relativePath;
}
exports.relativeTo = relativeTo;
function addFile(vsproj, filePath, itemType) {
    const itemGroups = vsproj.xml.getroot().findall(`./ItemGroup/${itemType}/..`);
    const itemGroup = itemGroups.length
        ? itemGroups[itemGroups.length - 1]
        : etree.SubElement(vsproj.xml.getroot(), 'ItemGroup');
    const itemElement = etree.SubElement(itemGroup, itemType);
    itemElement.set('Include', relativeTo(vsproj, filePath, true));
}
exports.addFile = addFile;
function removeFile(vsproj, filePath, directory = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const root = vsproj.xml.getroot();
        const filePathRel = relativeTo(vsproj, filePath);
        const itemGroups = root.findall('./ItemGroup');
        let found = false;
        itemGroups.forEach(itemGroup => {
            let elements = directory
                ? itemGroup.findall(`./*[@Include]`).filter(element => {
                    return (
                    //Directory itself
                    element.attrib['Include'] === filePathRel ||
                        //Sub directories
                        element.attrib['Include'].startsWith(filePathRel + "\\"));
                })
                : itemGroup.findall(`./*[@Include='${filePathRel}']`);
            for (const element of elements) {
                itemGroup.remove(element);
            }
            if (!found) {
                found = elements.length > 0;
            }
        });
        return found;
    });
}
exports.removeFile = removeFile;
function readFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        return stripBom(yield fs.readFile(path, 'utf8'));
    });
}
function getProjFileXmlEncoding(encoding) {
    return encoding === "ascii" ? "Windows-1252" : "utf-8";
}
function persist(vsproj, encoding = "ascii", indent = 2) {
    return __awaiter(this, void 0, void 0, function* () {
        const xmlString = vsproj.xml.write({ indent, encoding: getProjFileXmlEncoding(encoding) });
        const xmlFinal = (xmlString)
            .replace(/(?<!\r)\n/g, '\r\n'); // use CRLF
        // no newline at end of file ?
        // .replace(/(\r)?(\n)+$/, '');
        //Removing Visual Studio read-only flag on this file so that we can write on it
        yield fs.chmod(vsproj.fsPath, "777");
        //Explicitly synchronous to avoid concurrent writes
        fs.writeFileSync(vsproj.fsPath, xmlFinal, { encoding });
        // Ensure that that cached XML is up-to-date
        _cacheXml[vsproj.fsPath] = vsproj.xml;
    });
}
exports.persist = persist;
function getProjforFile(filePath, projectFileExtension, rootPaths) {
    return __awaiter(this, void 0, void 0, function* () {
        const fsPath = yield getProjPath(path.dirname(filePath), projectFileExtension, rootPaths);
        const name = path.basename(fsPath);
        const xml = yield load(fsPath);
        return { fsPath, name, xml };
    });
}
exports.getProjforFile = getProjforFile;
function load(vsprojPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(vsprojPath in _cacheXml)) {
            const vsprojContent = yield readFile(vsprojPath);
            _cacheXml[vsprojPath] = etree.parse(vsprojContent);
        }
        return _cacheXml[vsprojPath];
    });
}
let _doInvalidation = true;
function invalidate(filePath) {
    if (_doInvalidation)
        delete _cacheXml[filePath];
}
exports.invalidate = invalidate;
function invalidateAll() {
    _cacheXml = Object.create(null);
}
exports.invalidateAll = invalidateAll;
//# sourceMappingURL=vsproj.js.map