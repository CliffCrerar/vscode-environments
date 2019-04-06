"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function activateColorDecorations(decoratorProvider, context, client) {
    const compositeImagePath = context.asAbsolutePath("images/composite_wide.svg");
    const compositeAndPaintImagePath = context.asAbsolutePath("images/composite_paint_wide.svg");
    const compositePaintAndLayoutImagePath = context.asAbsolutePath("images/composite_paint_layout_wide.svg");
    const compositeImagePathSmall = context.asAbsolutePath("images/composite.svg");
    const compositeAndPaintImagePathSmall = context.asAbsolutePath("images/paint.svg");
    const compositePaintAndLayoutImagePathSmall = context.asAbsolutePath("images/layout.svg");
    const validEngines = ["blink", "gecko", "webkit", "edgehtml"];
    var hoveronly = vscode_1.window.createTextEditorDecorationType({});
    var composite = vscode_1.window.createTextEditorDecorationType({
        gutterIconPath: compositeImagePathSmall
    });
    var compositeAndPaint = vscode_1.window.createTextEditorDecorationType({
        gutterIconPath: compositeAndPaintImagePathSmall
    });
    var compositePaintAndLayout = vscode_1.window.createTextEditorDecorationType({
        gutterIconPath: compositePaintAndLayoutImagePathSmall
    });
    context.subscriptions.push(composite);
    context.subscriptions.push(compositeAndPaint);
    context.subscriptions.push(compositePaintAndLayout);
    context.subscriptions.push(vscode_1.workspace.onDidChangeTextDocument(e => {
        if (e) {
            throttledScan(e.document);
        }
    }));
    context.subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(e => {
        if (e) {
            throttledScan(e.document);
        }
    }));
    context.subscriptions.push(vscode_1.workspace.onDidChangeWorkspaceFolders(() => {
        refreshAllVisibleEditors();
    }));
    context.subscriptions.push(vscode_1.window.onDidChangeTextEditorVisibleRanges(event => {
        if (event && event.textEditor && event.textEditor.document) {
            const document = event.textEditor.document;
            throttledScan(document, 50);
        }
    }));
    context.subscriptions.push(vscode_1.workspace.onDidOpenTextDocument(e => {
        if (e) {
            throttledScan(e);
        }
    }));
    let pendingScans = {};
    let throttleIds = {};
    let throttledScan = (document, timeout = 500) => {
        if (document && document.uri) {
            const lookupKey = document.uri.toString();
            if (throttleIds[lookupKey])
                clearTimeout(throttleIds[lookupKey]);
            throttleIds[lookupKey] = setTimeout(() => {
                scan(document);
                delete throttleIds[lookupKey];
            }, timeout);
        }
    };
    const refreshAllVisibleEditors = () => {
        vscode_1.window.visibleTextEditors
            .map(p => p.document)
            .filter(p => p != null)
            .forEach(doc => throttledScan(doc));
    };
    function getPendingScan(document) {
        const pendingScan = pendingScans[document.uri.toString()] || {
            token: new vscode_1.CancellationTokenSource()
        };
        pendingScan[document.uri.toString()] = pendingScan;
        return pendingScan;
    }
    function scan(document) {
        const editors = findEditorsForDocument(document);
        if (editors.length > 0) {
            const visibleLines = [];
            for (const editor of editors) {
                for (const range of editor.visibleRanges) {
                    let lineIndex = range.start.line;
                    while (lineIndex <= range.end.line) {
                        visibleLines.push(lineIndex);
                        lineIndex++;
                    }
                }
            }
            let isDecorationEnabled = vscode_1.workspace.getConfiguration("csstriggers").get("showDecoration", true) == true;
            const scanResult = getPendingScan(document);
            scanResult.token.cancel();
            scanResult.token = new vscode_1.CancellationTokenSource();
            decoratorProvider(document, visibleLines, scanResult.token.token).then(symbolResponse => {
                var mapper = (symbol) => {
                    var range = client.protocol2CodeConverter.asRange(symbol.range);
                    const getHoverData = (data) => {
                        let hoverData = [];
                        let buckets = {
                            composite: [],
                            paint: [],
                            layout: []
                        };
                        for (const engine in data) {
                            const phaseData = data[engine];
                            const type = isComposite(phaseData) ? "composite" : isCompositeAndPaint(phaseData) ? "paint" : "layout";
                            buckets[type].push(engine);
                        }
                        for (const type in buckets) {
                            if (["composite", "layout", "paint"].indexOf(type) == -1)
                                continue;
                            let path;
                            let explanation;
                            let titleAndCaption = type;
                            switch (type) {
                                case "composite": {
                                    path = compositeImagePath;
                                    explanation = "Will result only in `compositing`.";
                                    break;
                                }
                                case "paint": {
                                    path = compositeAndPaintImagePath;
                                    explanation = "The affected element will be `painted` and `composited`.";
                                    break;
                                }
                                case "layout": {
                                    path = compositePaintAndLayoutImagePath;
                                    explanation =
                                        "Any affected areas will need to be `layouted`, and the" +
                                            forcedEol + //
                                            "final `painted` elements will need to be `composited`" +
                                            forcedEol + //
                                            "back together.";
                                    break;
                                }
                            }
                            // The markdown path parser under windows escapes the `userhome\.vscode` folder as `userhome.vscode`
                            if (process.platform === "win32") {
                                path = path.replace("\\.", "\\\\.");
                            }
                            if (buckets[type].length) {
                                const engines = buckets[type];
                                hoverData.push({
                                    engines,
                                    titleAndCaption,
                                    path,
                                    explanation
                                });
                            }
                        }
                        return hoverData;
                    };
                    const forcedEol = "  \r\n";
                    const emptyLine = forcedEol + forcedEol;
                    const formatAsTable = (p) => {
                        let hoverMessage;
                        if (showLegend) {
                            hoverMessage = //
                                `| ![${p.titleAndCaption}](${p.path} '${p.titleAndCaption}') ${p.engines.join(", ")} |${forcedEol}` + //
                                    `| :--------- |${forcedEol}` + //
                                    `| ${p.explanation} | ${emptyLine}`; //;
                        }
                        else {
                            hoverMessage = `![${p.titleAndCaption}](${p.path} '${p.titleAndCaption}') ${p.engines.join(", ")} ${emptyLine}`;
                        }
                        return hoverMessage;
                    };
                    let hoverMessage = "";
                    let showExtendedInformation = vscode_1.workspace
                        .getConfiguration("csstriggers")
                        .get("showExtendedInformation", false);
                    let showLegend = vscode_1.workspace.getConfiguration("csstriggers").get("showLegend", true);
                    if (showExtendedInformation) {
                        hoverMessage += "*Change from default*" + emptyLine;
                        hoverMessage += getHoverData(symbol.data.initial)
                            .map(p => formatAsTable(p))
                            .join(forcedEol);
                        hoverMessage += "------" + forcedEol;
                        hoverMessage += "*Subsequent updates*" + emptyLine;
                        hoverMessage += getHoverData(symbol.data.change)
                            .map(p => formatAsTable(p))
                            .join(forcedEol);
                        hoverMessage += "------" + forcedEol;
                    }
                    else {
                        hoverMessage =
                            getHoverData({ [defaultEngine]: symbol.data.change[defaultEngine] })
                                .map(p => {
                                const explanation = showLegend ? `${forcedEol}${p.explanation.replace(/\r\n/g, "")}` : "";
                                const hoverMessage = `![${p.titleAndCaption}](${p.path} '${p.titleAndCaption}')${explanation}${emptyLine}`;
                                return hoverMessage;
                            })
                                .join("") + forcedEol;
                    }
                    return {
                        range,
                        hoverMessage
                    };
                };
                let defaultEngine = vscode_1.workspace.getConfiguration("csstriggers").get("defaultEngine", "blink");
                if (validEngines.indexOf(defaultEngine) == -1) {
                    defaultEngine = "blink";
                }
                const browserData = (p) => {
                    return p.data.change[defaultEngine];
                };
                const isComposite = (data) => data.composite && !data.paint && !data.layout;
                const isCompositeAndPaint = (data) => data.composite && data.paint && !data.layout;
                const isCompositePaintAndLayout = (data) => data.composite && data.paint && data.layout;
                const compositeTriggers = (response) => response.symbols.filter(p => isComposite(browserData(p)));
                const compositeAndPaintTriggers = (response) => response.symbols.filter(p => isCompositeAndPaint(browserData(p)));
                const compositePaintAndLayoutTriggers = (response) => response.symbols.filter(p => isCompositePaintAndLayout(browserData(p)));
                if (isDecorationEnabled) {
                    setDecorationsForEditors(editors, hoveronly, []);
                    setDecorationsForEditors(editors, composite, compositeTriggers(symbolResponse).map(s => mapper(s)));
                    setDecorationsForEditors(editors, compositeAndPaint, compositeAndPaintTriggers(symbolResponse).map(s => mapper(s)));
                    setDecorationsForEditors(editors, compositePaintAndLayout, compositePaintAndLayoutTriggers(symbolResponse).map(s => mapper(s)));
                }
                else {
                    let allSymbols = [];
                    allSymbols = allSymbols.concat(compositeTriggers(symbolResponse).map(s => mapper(s)));
                    allSymbols = allSymbols.concat(compositeAndPaintTriggers(symbolResponse).map(s => mapper(s)));
                    allSymbols = allSymbols.concat(compositePaintAndLayoutTriggers(symbolResponse).map(s => mapper(s)));
                    setDecorationsForEditors(editors, hoveronly, allSymbols);
                    setDecorationsForEditors(editors, composite, []);
                    setDecorationsForEditors(editors, compositeAndPaint, []);
                    setDecorationsForEditors(editors, compositePaintAndLayout, []);
                }
            });
        }
        else {
            setDecorationsForEditors(editors, composite, []);
            setDecorationsForEditors(editors, compositeAndPaint, []);
            setDecorationsForEditors(editors, compositePaintAndLayout, []);
        }
    }
    refreshAllVisibleEditors();
}
exports.activateColorDecorations = activateColorDecorations;
function setDecorationsForEditors(editors, type, options) {
    editors.forEach(editor => editor.setDecorations(type, options));
}
function findEditorsForDocument(document) {
    return vscode_1.window.visibleTextEditors.filter(p => p.document.uri === document.uri);
}
//# sourceMappingURL=triggerdecorator.js.map