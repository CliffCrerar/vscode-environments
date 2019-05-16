/* --------------------------------------------------------------------------------------------
 * Copyright (c) S-Core Co., Ltd. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const showdown = require("showdown");
const showdownHtmlEscape = require("showdown-htmlescape");
const vscode = require("vscode");
const deepscanCodeActionProvider_1 = require("./deepscanCodeActionProvider");
class showRuleCodeActionProvider extends deepscanCodeActionProvider_1.default {
    constructor(context, { rules, style }) {
        super('show-rule');
        this.command = vscode.commands.registerCommand(this.getCommandId(), this.execute, this);
        context.subscriptions.push(this.command);
        this.provider = new TextDocumentContentProvider(context, { rules, style });
        vscode.workspace.registerTextDocumentContentProvider(this.getScheme(), this.provider);
    }
    codeActions(document, range, diagnostics, token) {
        //let text = document.getText(diagnostic.range);
        let commands = [];
        diagnostics.forEach(diagnostic => {
            commands.push({
                arguments: [document, diagnostic.code],
                command: this.getCommandId(),
                title: `Show rule ${diagnostic.code}`,
            });
        });
        return commands;
    }
    execute(document, ruleKey) {
        const uri = this.getUri();
        const column = vscode.ViewColumn.Two;
        const options = {
            enableScripts: true,
            enableCommandUris: true,
            enableFindWidget: false,
            retainContextWhenHidden: true
        };
        if (!this._panel) {
            const viewType = 'deepscan.show-rule';
            const tabTitle = 'DeepScan Rule';
            this._panel = vscode.window.createWebviewPanel(viewType, tabTitle, { viewColumn: column, preserveFocus: true }, options);
            this._panel.onDidDispose(() => {
                this._panel = null;
            });
        }
        this.provider.set(ruleKey);
        this._panel.webview.html = this.provider.provideTextDocumentContent(uri);
        this._panel.reveal();
    }
    dispose() {
        this.command.dispose();
    }
}
exports.default = showRuleCodeActionProvider;
class TextDocumentContentProvider {
    constructor(context, { rules, style }) {
        this._onDidChange = new vscode.EventEmitter();
        this.context = context;
        this.rules = rules;
        this.style = style;
        showdown.setFlavor('github');
        this.converter = new showdown.Converter({ extensions: [showdownHtmlEscape] });
        //this.imgBug = new Buffer(fs.readFileSync(path.resolve(this.context.extensionPath, "resources", "fa-bug.png"))).toString('base64');
    }
    provideTextDocumentContent(uri) {
        return this.createSnippet();
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    set(ruleKey) {
        this.ruleKey = ruleKey;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
    createSnippet() {
        function slugify(text) {
            return text.toString().toLowerCase()
                .replace(/\s+/g, '-') // Replace spaces with -
                .replace(/[^\w\-]+/g, '') // Remove all non-word chars
                .replace(/\_/g, '-') // Replace _ with -
                .replace(/\-\-+/g, '-') // Replace multiple - with single -
                .replace(/^-+/, '') // Trim - from start of text
                .replace(/-+$/, ''); // Trim - from end of text
        }
        const NO_RULE = 'No description is available';
        let content = NO_RULE;
        let rule;
        if (this.rules && (rule = _.find(this.rules, (rule) => rule.key === this.ruleKey))) {
            const tags = _.compact(rule.tag);
            let sees = [];
            _.forEach(rule.cwe, (cwe) => {
                sees.push(`[CWE-${cwe}](https://cwe.mitre.org/data/definitions/${cwe}.html)`);
            });
            sees = sees.concat(rule.see);
            content = `<ul class="deepscan-rule-detail">
                        <li class="deepscan-rule-detail-property">`;
            _.forEach(rule.severity, (severity) => {
                content += `<span class="severity" data-severity="${severity}"><i class="circle"></i>${severity}</span>`;
            });
            content += `<li class="deepscan-rule-detail-property"><span class="icon icon-${rule.type === 'Error' ? 'error' : 'code-quality'}"></span> ${rule.type}
                        <li class="deepscan-rule-detail-property"><span class="icon icon-tags"></span> ${tags.length > 0 ? tags.join(', ') : 'No tags'}
                        <li class="deepscan-rule-detail-property"><span class="icon icon-bookmark"></span> <a href="https://deepscan.io/docs/rules/${slugify(rule.key)}">${rule.key}</a>
                       </ul>

                       <div class="deepscan-rule-description">
                           <h2>${rule.name}</h2>
                           ${this.converter.makeHtml(rule.description)}
                           <h3>Code Example</h3>
                           <pre><code class="language-javascript">${_.escape(rule.examples)}</code></pre>
                           <h3>Revised Code Example</h3>
                           <pre><code class="language-javascript">${_.escape(rule.examplesRevised)}</code></pre>`;
            if (sees.length > 0) {
                content += `<h3>See</h3>
                            <ul>`;
                _.forEach(sees, (see) => {
                    content += `<li>${this.converter.makeHtml(see)}</li>`;
                });
                content += `</ul>`;
            }
            content += `</div>`;
        }
        return `<style>${this.style}</style><body><div class="deepscan-rule">${content}</div></body>`;
    }
}
//# sourceMappingURL=showRuleCodeActionProvider.js.map