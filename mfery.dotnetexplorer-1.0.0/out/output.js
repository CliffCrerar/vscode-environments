'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
// let output: vscode.OutputChannel;
let context;
let currentPanel = undefined;
function showUsage(extensionContext, choice, optionLabels) {
    context = extensionContext;
    showInformationMessage(choice, optionLabels);
    // fillOutputChannel(choice, optionLabels);
    if (currentPanel && currentPanel.visible) {
        showWebView(choice, optionLabels);
    }
}
exports.showUsage = showUsage;
function showInformationMessage(choice, optionLabels) {
    vscode.window.showInformationMessage(`Usage: \"${choice.usage}\"`, ...['Copy', 'Details']).then(selection => {
        if (selection === 'Copy') {
            vscode.env.clipboard.writeText(choice.usage);
            vscode.window.showInformationMessage('dotnet command was copied to the clipboard');
        }
        else if (selection === 'Details') {
            // output.show();
            showWebView(choice, optionLabels);
        }
    });
}
// function fillOutputChannel(choice: Choice, optionLabels: string[]) {    
// 	if (!output) {
// 		output = vscode.window.createOutputChannel('dotnet explore');
// 	} else {
//         output.clear();
//     }
// 	output.appendLine("I want to:");
// 	output.appendLine(` ${optionLabels.join(' ')}`);
// 	output.appendLine("Usage:");
// 	output.appendLine(` ${(choice.usage as string).split('\n\n').join('\n ')}`);
// 	if (choice.nb) {
// 		output.appendLine("Note:");
// 		output.appendLine(` ${(choice.nb as string).split('\n\n').join('\n ')}`);
// 	}
// 	output.appendLine(``);
// }
function showWebView(choice, optionLabels) {
    // Create and show panel
    if (currentPanel) {
        currentPanel.reveal(vscode.ViewColumn.Two);
    }
    else {
        currentPanel = vscode.window.createWebviewPanel('dotnetexplorer', 'dotnet CLI Explorer', vscode.ViewColumn.Two, {
            retainContextWhenHidden: true,
            enableScripts: true
        });
        currentPanel.onDidDispose(() => {
            currentPanel = undefined;
        }, undefined, context.subscriptions);
    }
    currentPanel.webview.html = getWebviewContent();
    // Send a message to our webview
    currentPanel.webview.postMessage({ choice, optionLabels });
}
function getWebviewContent() {
    const filePath = vscode.Uri.file(path.join(context.extensionPath, 'src', 'html', 'usage.html'));
    return fs.readFileSync(filePath.fsPath, 'utf8');
}
//# sourceMappingURL=output.js.map