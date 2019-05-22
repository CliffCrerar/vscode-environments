"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProjectTypeQuickPickItem {
    constructor(init) {
        Object.assign(this, init);
    }
}
ProjectTypeQuickPickItem.projectTypes = [
    new ProjectTypeQuickPickItem({
        label: "classlib",
        description: "Class library"
    }),
    new ProjectTypeQuickPickItem({
        label: "console",
        description: "Console Application"
    }),
    new ProjectTypeQuickPickItem({
        label: "mstest",
        description: "Unit Test Project"
    }),
    new ProjectTypeQuickPickItem({
        label: "xunit",
        description: "xUnit Test Project"
    }),
    new ProjectTypeQuickPickItem({
        label: "web",
        description: "ASP.NET Core Empty"
    }),
    new ProjectTypeQuickPickItem({
        label: "mvc",
        description: "ASP.NET Core Web App (MVC)"
    }),
    new ProjectTypeQuickPickItem({
        label: "razor",
        description: "ASP.NET Core Web App"
    }),
    new ProjectTypeQuickPickItem({
        label: "angular",
        description: "ASP.NET Core with Angular"
    }),
    new ProjectTypeQuickPickItem({
        label: "react",
        description: "ASP.NET Core with ReactJS"
    }),
    new ProjectTypeQuickPickItem({
        label: "reactredux",
        description: "ASP.NET Core with ReactJS and Redux"
    }),
    new ProjectTypeQuickPickItem({
        label: "webapi",
        description: "ASP.NET Core Web API"
    })
];
exports.ProjectTypeQuickPickItem = ProjectTypeQuickPickItem;
//# sourceMappingURL=projectTypeQuickPickItem.js.map