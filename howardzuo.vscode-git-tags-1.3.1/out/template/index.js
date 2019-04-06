"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const t = require("lodash.template");
const compiled = t(`
        <html>
            <link rel="stylesheet" href="${assetPath('css', 'gittags.css')}" >
            <body>
                <div id="container" class="ag-theme-blue"></div>

                <script>
                window.rows = <%= JSON.stringify(obj.tags) %>
                </script>
                <script src="${assetPath('js', 'aggrid.js')}"></script>
                <script src="${assetPath('js', 'app.js')}"></script>
            </body>
        </html>
    `, { variable: 'obj' });
function html(tags) {
    return compiled({
        tags
    });
}
exports.html = html;
function assetPath(...args) {
    return vscode.Uri.file(path.join(__dirname, '..', '..', 'assets', ...args)).toString();
}
function nodeModulesPath(...args) {
    return vscode.Uri.file(path.join(__dirname, '..', '..', 'node_modules', ...args)).toString();
}
//# sourceMappingURL=index.js.map