"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const file_contents_extended_1 = require("./file-contents-extended");
const add_files_1 = require("./add-files");
const utils_1 = require("./utils");
const fs = require("fs");
const path = require("path");
const Q = require("q");
class AddFilesExtended extends add_files_1.AddFiles {
    // Create the new "shared" folder for model and service
    createFolder(folderName) {
        const deferred = Q.defer();
        var fileExists = fs.existsSync(folderName);
        if (!fileExists) {
            fs.mkdir(folderName, (err) => {
                fs.mkdirSync(path.join(folderName, 'shared'));
                deferred.resolve(folderName);
            });
        }
        else {
            deferred.reject('Folder already exists');
        }
        return deferred.promise;
    }
    // Get file contents and create the new files in the folder 
    createFiles(folderName) {
        const deferred = Q.defer();
        var inputName = path.parse(folderName).name;
        const fc = new file_contents_extended_1.FileContentsExtended();
        const afe = new AddFilesExtended();
        let stylesheetFileExtension = utils_1.Utils.getStylesheetConfig();
        let addTestFile = utils_1.Utils.getAddTestFileConfig();
        // create an IFiles array including file names and contents
        var files = [
            {
                name: path.join(folderName, `${inputName}.component.ts`),
                content: fc.componentContent(inputName)
            },
            {
                name: path.join(folderName, `${inputName}.component.html`),
                content: fc.templateContent(inputName)
            },
            {
                name: path.join(folderName, `${inputName}.component.${stylesheetFileExtension}`),
                content: fc.cssContent(inputName)
            },
            {
                name: path.join(folderName, 'shared', `${inputName}.service.ts`),
                content: fc.serviceContent(inputName)
            },
            {
                name: path.join(folderName, 'shared', `${inputName}.model.ts`),
                content: fc.modelContent(inputName)
            }
        ];
        if (addTestFile) {
            files.push({
                name: path.join(folderName, `${inputName}.component.spec.ts`),
                content: fc.specContent(inputName)
            });
        }
        // write files
        afe.writeFiles(files).then((errors) => {
            if (errors.length > 0) {
                vscode_1.window.showErrorMessage(`${errors.length} file(s) could not be created. I'm sorry :-(`);
            }
            else {
                deferred.resolve(folderName);
            }
        });
        return deferred.promise;
    }
}
exports.AddFilesExtended = AddFilesExtended;
//# sourceMappingURL=add-files-extended.js.map