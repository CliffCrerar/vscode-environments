"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileContents {
    camelCase(input) {
        return input.replace(/-([a-z])/ig, function (all, letter) {
            return letter.toUpperCase();
        });
    }
    componentContent(inputName) {
        var inputUpperCase;
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);
        var componentContent = "import { Component, OnInit } from '@angular/core';\n" +
            "\n" +
            "@Component({\n" +
            "\tselector: '" + inputName + "',\n" +
            "\ttemplateUrl: '" + inputName + ".component.html'\n" +
            "})\n" +
            "\n" +
            "export class " + inputUpperCase + "Component implements OnInit {\n" +
            "\n" +
            "\tngOnInit() { }\n" +
            "}";
        return componentContent;
    }
    templateContent(inputName) {
        var inputUpperCase;
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);
        var templateContent = `<div class="${inputName}"> Hello ${inputUpperCase}Component! </div>`;
        return templateContent;
    }
    cssContent(inputName) {
        var inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        var cssContent = `.${inputName} {\n\n}`;
        return cssContent;
    }
    specContent(inputName) {
        var inputUpperCase;
        inputUpperCase = inputName.charAt(0).toUpperCase() + inputName.slice(1);
        inputUpperCase = this.camelCase(inputUpperCase);
        var specContent = "import { TestBed, inject } from '@angular/core/testing';\n\n" +
            "import { " + inputUpperCase + "Component } from './" + inputName + ".component';\n" +
            "\n" +
            "describe('a " + inputName + " component', () => {\n" +
            "\tlet component: " + inputUpperCase + "Component;\n" +
            "\n" +
            "\t// register all needed dependencies\n" +
            "\tbeforeEach(() => {\n" +
            "\t\tTestBed.configureTestingModule({\n" +
            "\t\t\tproviders: [\n" +
            "\t\t\t\t" + inputUpperCase + "Component\n" +
            "\t\t\t]\n" +
            "\t\t});\n" +
            "\t});\n" +
            "\n" +
            "\t// instantiation through framework injection\n" +
            "\tbeforeEach(inject([" + inputUpperCase + "Component], (" + inputUpperCase + "Component) => {\n" +
            "\t\tcomponent = " + inputUpperCase + "Component;\n" +
            "\t}));\n" +
            "\n" +
            "\tit('should have an instance', () => {\n" +
            "\t\texpect(component).toBeDefined();\n" +
            "\t});\n" +
            "});";
        return specContent;
    }
}
exports.FileContents = FileContents;
//# sourceMappingURL=file-contents.js.map