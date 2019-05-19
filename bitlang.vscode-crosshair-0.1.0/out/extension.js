'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
let toggleCrosshair;
let isActive = true;
function getDecorationTypeFromConfig() {
    const config = vscode_1.workspace.getConfiguration("crosshair");
    const borderColor = config.get("borderColor");
    const borderWidth = config.get("borderWidth");
    const decorationType = vscode_1.window.createTextEditorDecorationType({
        isWholeLine: true,
        borderWidth: `0 0 ${borderWidth} 0`,
        borderStyle: 'solid',
        rangeBehavior: vscode_1.DecorationRangeBehavior.ClosedClosed,
        borderColor
    });
    return decorationType;
}
function getDecorationTypeCursorFromConfig() {
    const config = vscode_1.workspace.getConfiguration("crosshair");
    const borderColor = config.get("borderColor");
    const borderWidth = config.get("borderWidth");
    const decorationType = vscode_1.window.createTextEditorDecorationType({
        borderStyle: 'solid',
        rangeBehavior: vscode_1.DecorationRangeBehavior.ClosedClosed,
        borderWidth: `0 ${borderWidth} 0 0`,
        borderColor
    });
    return decorationType;
}
function updateDecorationsOnEditor(editor, currentPosition, decorationType, decorationTypeBlock) {
    const newDecorations = [new vscode_1.Range(currentPosition, currentPosition)];
    const newDecorationsLines = [new vscode_1.Range(currentPosition, currentPosition)];
    let maxLines = editor.document.lineCount;
    let start_cline = currentPosition.line;
    let end_cline = start_cline;
    if (start_cline > 10) {
        start_cline -= 10;
    }
    if (start_cline < 0) {
        start_cline = 0;
    }
    end_cline += 10;
    if (end_cline > maxLines) {
        end_cline = maxLines;
    }
    let prevChar = currentPosition.character > 0 ? currentPosition.character - 1 : 0;
    for (let p = start_cline; p < end_cline; p++) {
        if (p > maxLines || p === 0) {
            break;
        }
        let cline = editor.document.lineAt(p);
        let missing = currentPosition.character - cline.text.length;
        if (missing > 0) {
            let c = 0;
            let s = "";
            for (c = 0; c < missing; c++) {
                s += " ";
            }
            editor.edit(edit => {
                edit.insert(new vscode_1.Position(p, cline.text.length), s);
            });
            //  let theend = TextEdit.insert(new Position(p, cline.text.length),s);
            //  editor.edit()
        }
        let pos = new vscode_1.Position(p, prevChar);
        let currentPos = new vscode_1.Position(p, currentPosition.character);
        newDecorationsLines.push(new vscode_1.Range(pos, currentPos));
    }
    editor.setDecorations(decorationType, newDecorations);
    editor.setDecorations(decorationTypeBlock, newDecorationsLines);
}
function updateDecorations(activeTextEditor, decorationType, decorationTypeBlock, updateAllVisibleEditors = false) {
    if (!isActive) {
        const newDecorations = [];
        const newDecorationsLines = [];
        activeTextEditor.setDecorations(decorationType, newDecorations);
        activeTextEditor.setDecorations(decorationTypeBlock, newDecorationsLines);
        vscode_1.window.showTextDocument(activeTextEditor.document);
        return;
    }
    try {
        if (updateAllVisibleEditors) {
            vscode_1.window.visibleTextEditors.forEach((editor) => {
                updateDecorationsOnEditor(activeTextEditor, activeTextEditor.selection.active, decorationType, decorationTypeBlock);
            });
        }
        else {
            vscode_1.window.visibleTextEditors.forEach((editor) => {
                if (editor !== vscode_1.window.activeTextEditor) {
                    return;
                }
                updateDecorationsOnEditor(activeTextEditor, activeTextEditor.selection.active, decorationType, decorationTypeBlock);
            });
        }
    }
    catch (error) {
        console.error("Error from ' updateDecorations' -->", error);
    }
    finally {
        return new vscode_1.Position(activeTextEditor.selection.active.line, activeTextEditor.selection.active.character);
    }
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let decorationTypeBlock = getDecorationTypeCursorFromConfig();
    let decorationType = getDecorationTypeFromConfig();
    let timeout = undefined;
    vscode_1.window.onDidChangeActiveTextEditor(() => {
        if (vscode_1.window.activeTextEditor !== undefined) {
            try {
                updateDecorations(vscode_1.window.activeTextEditor, decorationType, decorationTypeBlock);
            }
            catch (error) {
                console.error("Error from ' window.onDidChangeActiveTextEditor' -->", error);
            }
        }
    });
    vscode_1.window.onDidChangeTextEditorSelection(() => {
        if (vscode_1.window.activeTextEditor !== undefined) {
            updateDecorations(vscode_1.window.activeTextEditor, decorationType, decorationTypeBlock);
        }
    });
    vscode_1.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    var toggleCrosshairCommand = vscode_1.commands.registerCommand('crosshair.toggle_crosshair', function () {
        isActive = !isActive;
        triggerUpdateDecorations();
    });
    context.subscriptions.push(toggleCrosshairCommand);
    toggleCrosshair = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right);
    toggleCrosshair.text = "＋ₐ";
    toggleCrosshair.command = "crosshair.toggle_crosshair";
    toggleCrosshair.show();
    let activeEditor = vscode_1.window.activeTextEditor;
    function updateDecorationsTimer() {
        if (!activeEditor) {
            return;
        }
        updateDecorations(activeEditor, decorationType, decorationTypeBlock);
    }
    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        timeout = setTimeout(updateDecorationsTimer, 500);
    }
    if (activeEditor) {
        triggerUpdateDecorations();
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map