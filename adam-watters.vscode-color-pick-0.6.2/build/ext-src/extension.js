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
const path = require("path");
const vscode = require("vscode");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
const environment = process && process.env && process.env.VSCODE_DEBUG_MODE === "true"
    ? "development"
    : "production";
let reporter;
function activate(context) {
    const extensionId = "adam-watters.vscode-color-pick";
    const key = "4a812e02-fb45-447f-a2bc-42bf98535773";
    const extension = vscode.extensions.getExtension(extensionId) || {
        packageJSON: "undefined"
    };
    reporter = new vscode_extension_telemetry_1.default(extensionId, extension.packageJSON.version, key);
    console.log("activate");
    context.subscriptions.push(vscode.commands.registerCommand("pick-color", () => {
        ReactPanel.createOrShow(context.extensionPath, context.globalState, reporter);
    }));
}
exports.activate = activate;
function deactivate() {
    reporter.dispose();
}
exports.deactivate = deactivate;
const shouldUseTelemetry = () => {
    return (process.env.VSCODE_DEBUG_MODE === "true" ||
        vscode.workspace.getConfiguration().get("color-pick.analytics") ||
        false);
};
const defaultState = {
    color: {
        hex: "#194D33",
        rgb: {
            a: 1,
            b: 65,
            g: 255,
            r: 0
        }
    },
    mode: "rgba"
};
/**
 * Manages react webview panels
 */
class ReactPanel {
    constructor(extensionPath, globalState, initialState, column, reporter) {
        this._disposables = [];
        this._extensionPath = extensionPath;
        this._globalState = globalState;
        // Create and show a new webview panel
        this._panel = vscode.window.createWebviewPanel(ReactPanel.viewType, "Color Pick", column, {
            // Enable javascript in the webview
            enableScripts: true,
            // And restric the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                vscode.Uri.file(path.join(this._extensionPath, "build"))
            ]
        });
        // Set the webview's initial html content
        this._panel.webview.html = this._getHtmlForWebview(initialState);
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case "search":
                    const { searchString } = message;
                    shouldUseTelemetry() &&
                        reporter.sendTelemetryEvent("search", {
                            searchString,
                            environment
                        });
                case "colorChanged":
                    const { mode, color: { rgb: { r, g, b, a }, hex } } = message;
                    shouldUseTelemetry() &&
                        reporter.sendTelemetryEvent("colorChanged", {
                            environment,
                            mode,
                            hex,
                            rgb: `${r},${g},${b},${a}`
                        });
                    this._globalState.update("app", {
                        color: message.color,
                        mode: message.mode
                    });
                    const colorString = mode === "hex" ? hex : `rgba(${r},${g},${b},${a})`;
                    vscode.window.showInformationMessage(`${colorString} copied to clipboard`);
            }
        }, null, this._disposables);
    }
    static createOrShow(extensionPath, globalState, reporter) {
        return __awaiter(this, void 0, void 0, function* () {
            const column = vscode.window.activeTextEditor
                ? vscode.window.activeTextEditor.viewColumn
                : undefined;
            const initialState = yield globalState.get("app");
            // If we already have a panel, show it.
            // Otherwise, create a new panel.
            if (ReactPanel.currentPanel) {
                ReactPanel.currentPanel._panel.reveal(column);
            }
            else {
                ReactPanel.currentPanel = new ReactPanel(extensionPath, globalState, initialState || defaultState, column || vscode.ViewColumn.One, reporter);
            }
        });
    }
    doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: "refactor" });
    }
    dispose() {
        ReactPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _getHtmlForWebview(initialState) {
        const manifest = require(path.join(this._extensionPath, "build", "asset-manifest.json"));
        const mainScript = manifest["main.js"];
        const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, "build", mainScript));
        const scriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });
        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();
        shouldUseTelemetry() &&
            reporter.sendTelemetryEvent("extensionStarted", { environment });
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>Color Pick</title>
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
				<base href="${vscode.Uri.file(path.join(this._extensionPath, "build")).with({
            scheme: "vscode-resource"
        })}/">
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>
        <script nonce="${nonce}" >
          INITIAL_COLOR_PICKER_DATA = ${JSON.stringify(initialState)}
        </script> 
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}
ReactPanel.viewType = "color-pick";
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=extension.js.map