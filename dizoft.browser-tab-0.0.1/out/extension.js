'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const axios_1 = require("axios");
function activate(context) {
    // TODO: collect all errors and send feedback
    const disposable = vscode.commands.registerCommand('extension.browsertab', () => {
        vscode.window.showInputBox({
            prompt: 'Enter a site url. Example: http://localhost',
            value: 'http://',
            ignoreFocusOut: true,
            placeHolder: 'Site url',
            validateInput: (value) => {
                // TODO: need validate
                return '';
            }
        }).then(url => {
            if (url) {
                const panel = vscode.window.createWebviewPanel('browserTab', 'browserTab', vscode.ViewColumn.Active, {
                    enableScripts: true
                });
                // http:// || https://
                const host = url.substring(0, url.indexOf('//' + 2));
                // Get HTML content of site
                getWebContent(url).then((content) => {
                    // Convert link to style
                    getStyles(host, url, content.data).then((styles) => {
                        // Show data
                        panel.webview.html = [
                            styles,
                            content.data
                        ].join(' ');
                    }).catch((e) => {
                        console.error('getStyles error', e);
                    });
                }).catch((e) => {
                    console.error('getWebContent error', e);
                });
            }
            else {
                vscode.window.showInformationMessage('The url can be specified! Do nothing');
            }
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
/**
 * TODO: collect all errors and send feedback
 * Convert <link> to <style>
 * @param {string} host Host of site (http://|https://)
 * @param {string} url Base url
 * @param {string} content HTML content by url
 */
function getStyles(host, url, content) {
    return new Promise((resolve) => {
        // Regexp for find all html tag <link>
        const findLinkRegexp = /\<link\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g, 
        // Regexp for test only stylesheet <link>
        findStyleSheetRegexp = /rel=\"stylesheet\"/, 
        // Regexp for find attribute href in <link>
        findLinkHrefRegexp = /href=\"(.*?)\"/, 
        // All founded <link>
        links = content.match(findLinkRegexp);
        if (links && Array.isArray(links)) {
            // Css inline styles
            const cssStyles = [], 
            // All axios promises for getting raw css
            cssPromises = [];
            links.forEach((item) => {
                // If this link is stylesheet
                if (findStyleSheetRegexp.test(item)) {
                    // Try find href attribute
                    const needle = item.match(findLinkHrefRegexp);
                    // If found
                    if (needle && Array.isArray(needle) && needle.hasOwnProperty('1')) {
                        // Build url for getting css
                        const cssUrl = (needle[1].substring(0, 2) === '//')
                            ? host + needle[1].substring(2, needle[1].length)
                            : url + '/' + needle[1];
                        cssPromises.push(axios_1.default.get(cssUrl));
                    }
                }
            });
            if (cssPromises) {
                // Getting all css's
                Promise.all(cssPromises).then((values) => {
                    values.forEach((item) => {
                        // Genetare inline style
                        cssStyles.push([
                            '<style type="text/css">',
                            item.data,
                            '</style>'
                        ].join(' '));
                    });
                    resolve(cssStyles.join(' '));
                }).catch((e) => {
                    console.error('cssPromises error', e);
                });
            }
        }
        else {
            resolve('');
        }
    });
}
/**
 * Get web content by URL
 */
function getWebContent(url) {
    return axios_1.default.get(url);
}
//# sourceMappingURL=extension.js.map