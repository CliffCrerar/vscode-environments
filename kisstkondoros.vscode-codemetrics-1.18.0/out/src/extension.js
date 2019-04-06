"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const CodeMetricsCodeLensProvider_1 = require("./codelensprovider/CodeMetricsCodeLensProvider");
const AppConfiguration_1 = require("./models/AppConfiguration");
const MetricsUtil_1 = require("./metrics/MetricsUtil");
const EditorDecoration_1 = require("./editordecoration/EditorDecoration");
function activate(context) {
    const config = new AppConfiguration_1.AppConfiguration();
    const metricsUtil = new MetricsUtil_1.MetricsUtil(config, context);
    const disposables = [];
    disposables.push(vscode_1.languages.registerCodeLensProvider(metricsUtil.selector, new CodeMetricsCodeLensProvider_1.CodeMetricsCodeLensProvider(metricsUtil)));
    disposables.push(new EditorDecoration_1.EditorDecoration(context, metricsUtil));
    const triggerCodeLensComputation = () => {
        if (!vscode.window.activeTextEditor) {
            return;
        }
        var end = vscode.window.activeTextEditor.selection.end;
        vscode.window.activeTextEditor
            .edit(editbuilder => {
            editbuilder.insert(end, " ");
        })
            .then(() => {
            vscode_1.commands.executeCommand("undo");
        });
    };
    disposables.push(vscode_1.commands.registerCommand("codemetrics.toggleCodeMetricsForArrowFunctions", () => {
        config.codeMetricsForArrowFunctionsToggled = !config.codeMetricsForArrowFunctionsToggled;
        config.toggleCodeMetricsForArrowFunctionsExecuted = true;
        triggerCodeLensComputation();
    }));
    disposables.push(vscode_1.commands.registerCommand("codemetrics.toggleCodeMetricsDisplayed", () => {
        config.codeMetricsDisplayed = !config.codeMetricsDisplayed;
        triggerCodeLensComputation();
    }));
    disposables.push(vscode_1.commands.registerCommand("codemetrics.showCodeMetricsCodeLensInfo", (codelens) => {
        var items = codelens.getChildren().filter(item => item.getCollectedComplexity() > 0);
        var explanations = items
            .map(item => item.toLogString("").trim() + " - " + item.description)
            .map(item => item.replace(/[\r\n]+/g, " "));
        vscode.window.showQuickPick(explanations).then(selected => {
            if (selected) {
                var selectedCodeLens = items[explanations.indexOf(selected)];
                if (selectedCodeLens) {
                    var characterPosition = vscode.window.activeTextEditor.document.positionAt(selectedCodeLens.start);
                    vscode.window.activeTextEditor.selection = new vscode.Selection(characterPosition, characterPosition);
                }
            }
        });
    }));
    context.subscriptions.push(...disposables);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map