"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class EditorDecoration {
    constructor(context, metricsUtil) {
        this.decorationModeEnabled = false;
        this.overviewRulerModeEnabled = false;
        this.metricsUtil = metricsUtil;
        const debouncedUpdate = this.debounce(() => this.update(), 500);
        this.didChangeTextDocument = vscode.workspace.onDidChangeTextDocument(e => {
            debouncedUpdate();
        });
        this.didOpenTextDocument = vscode.window.onDidChangeActiveTextEditor(e => {
            this.disposeDecorators();
            this.update();
        });
        this.update();
    }
    debounce(func, timeout) {
        let id;
        return () => {
            clearTimeout(id);
            id = setTimeout(() => func(), timeout);
        };
    }
    update() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !editor.document) {
            return;
        }
        const document = editor.document;
        const settings = this.metricsUtil.appConfig.getCodeMetricsSettings(document.uri);
        const languageDisabled = this.metricsUtil.selector.filter(s => s.language == document.languageId).length == 0;
        const decorationDisabled = !(settings.DecorationModeEnabled || settings.OverviewRulerModeEnabled);
        if (decorationDisabled || languageDisabled) {
            this.clearDecorators(editor);
            return;
        }
        // for some reason the context is lost
        var thisContext = this;
        this.metricsUtil.getMetrics(document).then(metrics => {
            if (thisContext.settingsChanged(settings) || this.low == null) {
                thisContext.clearDecorators(editor);
                thisContext.updateDecorators(settings, document.uri);
            }
            const toDecoration = (model) => {
                return {
                    hoverMessage: model.toString(settings),
                    range: thisContext.metricsUtil.toDecorationRange(model.start, document)
                };
            };
            const complexityAndModel = metrics.map(p => {
                return { complexity: p.getCollectedComplexity(), model: p };
            });
            const lowLevelDecorations = complexityAndModel
                .filter(p => p.complexity <= settings.ComplexityLevelNormal)
                .map(p => toDecoration(p.model));
            const normalLevelDecorations = complexityAndModel
                .filter(p => p.complexity > settings.ComplexityLevelNormal &&
                p.complexity <= settings.ComplexityLevelHigh)
                .map(p => toDecoration(p.model));
            const highLevelDecorations = complexityAndModel
                .filter(p => p.complexity > settings.ComplexityLevelHigh &&
                p.complexity <= settings.ComplexityLevelExtreme)
                .map(p => toDecoration(p.model));
            const extremeLevelDecorations = complexityAndModel
                .filter(p => p.complexity > settings.ComplexityLevelExtreme)
                .map(p => toDecoration(p.model));
            editor.setDecorations(thisContext.low, lowLevelDecorations);
            editor.setDecorations(thisContext.normal, normalLevelDecorations);
            editor.setDecorations(thisContext.high, highLevelDecorations);
            editor.setDecorations(thisContext.extreme, extremeLevelDecorations);
        }, e => {
            var exmsg = "";
            if (e.message) {
                exmsg += e.message;
            }
            if (e.stack) {
                exmsg += " | stack: " + e.stack;
            }
            console.error(exmsg);
        });
    }
    settingsChanged(settings) {
        const changed = settings.DecorationModeEnabled != this.decorationModeEnabled ||
            settings.DecorationTemplate != this.decorationTemplate ||
            settings.OverviewRulerModeEnabled != this.overviewRulerModeEnabled;
        this.decorationModeEnabled = settings.DecorationModeEnabled;
        this.decorationTemplate = settings.DecorationTemplate;
        this.overviewRulerModeEnabled = settings.OverviewRulerModeEnabled;
        return changed;
    }
    clearDecorators(editor) {
        this.low && editor.setDecorations(this.low, []);
        this.normal && editor.setDecorations(this.normal, []);
        this.high && editor.setDecorations(this.high, []);
        this.extreme && editor.setDecorations(this.extreme, []);
        this.disposeDecorators();
    }
    updateDecorators(settings, resource) {
        const size = vscode.workspace.getConfiguration("editor", resource).get("fontSize");
        this.low = this.createDecorationType(settings.DecorationModeEnabled, settings.OverviewRulerModeEnabled, settings.DecorationTemplate, settings.ComplexityColorLow, size);
        this.normal = this.createDecorationType(settings.DecorationModeEnabled, settings.OverviewRulerModeEnabled, settings.DecorationTemplate, settings.ComplexityColorNormal, size);
        this.high = this.createDecorationType(settings.DecorationModeEnabled, settings.OverviewRulerModeEnabled, settings.DecorationTemplate, settings.ComplexityColorHigh, size);
        this.extreme = this.createDecorationType(settings.DecorationModeEnabled, settings.OverviewRulerModeEnabled, settings.DecorationTemplate, settings.ComplexityColorExtreme, size);
    }
    createDecorationType(decorationModeEnabled, overviewRulerModeEnabled, decorationTemplate, color, size) {
        const options = {
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            overviewRulerColor: color,
            before: {
                contentIconPath: this.getContentIconPath(decorationTemplate, color, size),
                margin: `${size / 2}px`
            }
        };
        if (!decorationModeEnabled) {
            options.before = null;
        }
        if (!overviewRulerModeEnabled) {
            options.overviewRulerColor = null;
        }
        options.rangeBehavior = vscode.DecorationRangeBehavior.ClosedClosed;
        return vscode.window.createTextEditorDecorationType(options);
    }
    getContentIconPath(decorationTemplate, color, size) {
        const templateVariables = { color, size };
        const decoration = decorationTemplate
            .replace(/\{\{(.+?)\}\}/g, (match, varName) => templateVariables[varName]);
        return vscode.Uri.parse(`data:image/svg+xml,` +
            encodeURIComponent(decoration));
    }
    disposeDecorators() {
        this.low && this.low.dispose();
        this.normal && this.normal.dispose();
        this.high && this.high.dispose();
        this.extreme && this.extreme.dispose();
        this.low = null;
        this.normal = null;
        this.high = null;
        this.extreme = null;
    }
    dispose() {
        this.disposeDecorators();
        this.didChangeTextDocument.dispose();
        this.didOpenTextDocument.dispose();
    }
}
exports.EditorDecoration = EditorDecoration;
//# sourceMappingURL=EditorDecoration.js.map