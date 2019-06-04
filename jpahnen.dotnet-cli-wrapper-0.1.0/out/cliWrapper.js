"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shell = require("shelljs");
const cliHelper_1 = require("./cliHelper");
class CliWrapper {
    addReference(project, reference) {
        const cli = "dotnet add " + project + " reference " + reference;
        return new Promise(done => {
            const result = shell.exec(cli, { async: true }, (code, stdout, stderr) => {
                done(stdout + stderr);
            });
        });
    }
    getReferences(project) {
        const cli = "dotnet list " + project + " reference";
        return new Promise(done => {
            const result = shell.exec(cli, { async: true }, (code, stdout, stderr) => {
                let projects = [];
                if (stdout) {
                    projects = cliHelper_1.CliHelper.ParseListResult(stdout);
                }
                done(projects);
            });
        });
    }
    removeReference(project, reference) {
        const cli = "dotnet remove " + project + " reference " + reference;
        return new Promise(done => {
            const result = shell.exec(cli, { async: true }, (code, stdout, stderr) => {
                done(stdout + stderr);
            });
        });
    }
    getCliVersion() {
        const cli = "dotnet --version";
        return new Promise(done => {
            const result = shell.exec(cli, { async: true }, (code, stdout, stderr) => {
                done(stdout);
            });
        });
    }
    createProject(path, projectType, projectName) {
        const cli = `dotnet new ${projectType} -n ${projectName} -o ${path}`;
        return new Promise(done => {
            const result = shell.exec(cli, { async: true }, (code, stdout, stderr) => {
                done(stdout + stderr);
            });
        });
    }
    addProjectToSolution(solution, path, projectName) {
        const cli = `dotnet sln ${solution} add ${path}/${projectName}.csproj`;
        return new Promise(done => {
            const result = shell.exec(cli, { async: true }, (code, stdout, stderr) => {
                done(stdout + stderr);
            });
        });
    }
}
exports.CliWrapper = CliWrapper;
//# sourceMappingURL=cliWrapper.js.map