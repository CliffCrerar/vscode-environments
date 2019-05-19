/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_languageserver_1 = require("vscode-languageserver");
var protocol_configuration_proposed_1 = require("vscode-languageserver-protocol/lib/protocol.configuration.proposed");
var protocol_colorProvider_proposed_1 = require("vscode-languageserver-protocol/lib/protocol.colorProvider.proposed");
var vscode_css_languageservice_1 = require("vscode-css-languageservice");
var language_model_cache_1 = require("./language-model-cache");
var styled_jsx_utils_1 = require("./styled-jsx-utils");
// Create a connection for the server.
var connection = vscode_languageserver_1.createConnection();
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
// Create a simple text document manager. The text document manager
// supports full document sync only
var documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
var stylesheets = language_model_cache_1.getLanguageModelCache(10, 60, function (document) { return cssLanguageService.parseStylesheet(document); });
documents.onDidClose(function (e) {
    stylesheets.onDocumentRemoved(e.document);
});
connection.onShutdown(function () {
    stylesheets.dispose();
});
var scopedSettingsSupport = false;
// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
connection.onInitialize(function (params) {
    function hasClientCapability(name) {
        var keys = name.split('.');
        var c = params.capabilities;
        for (var i = 0; c && i < keys.length; i++) {
            c = c[keys[i]];
        }
        return !!c;
    }
    var snippetSupport = hasClientCapability('textDocument.completion.completionItem.snippetSupport');
    scopedSettingsSupport = hasClientCapability('workspace.configuration');
    var capabilities = {
        // Tell the client that the server works in FULL text document sync mode
        textDocumentSync: documents.syncKind,
        completionProvider: snippetSupport ? { resolveProvider: false } : undefined,
        hoverProvider: true,
        documentSymbolProvider: true,
        referencesProvider: true,
        definitionProvider: true,
        documentHighlightProvider: true,
        codeActionProvider: true,
        renameProvider: false,
        colorProvider: true
    };
    return { capabilities: capabilities };
});
var cssLanguageService = vscode_css_languageservice_1.getCSSLanguageService();
var documentSettings = {};
// remove document settings on close
documents.onDidClose(function (e) {
    delete documentSettings[e.document.uri];
});
function getDocumentSettings(textDocument) {
    if (scopedSettingsSupport) {
        var promise = documentSettings[textDocument.uri];
        if (!promise) {
            var configRequestParam = { items: [{ scopeUri: textDocument.uri, section: 'css' }] };
            promise = connection.sendRequest(protocol_configuration_proposed_1.ConfigurationRequest.type, configRequestParam).then(function (s) { return s[0]; });
            documentSettings[textDocument.uri] = promise;
        }
        return promise;
    }
    return Promise.resolve(void 0);
}
// The settings have changed. Is send on server activation as well.
connection.onDidChangeConfiguration(function (change) {
    updateConfiguration(change.settings.css);
});
function updateConfiguration(settings) {
    cssLanguageService.configure(settings);
    // reset all document settings
    documentSettings = {};
    // Revalidate any open text documents
    documents.all().forEach(triggerValidation);
}
var pendingValidationRequests = {};
var validationDelayMs = 200;
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(function (change) {
    triggerValidation(change.document);
});
// a document has closed: clear all diagnostics
documents.onDidClose(function (event) {
    clearDiagnostics(event.document);
});
function clearDiagnostics(document) {
    cleanPendingValidation(document);
    connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
}
function cleanPendingValidation(textDocument) {
    var request = pendingValidationRequests[textDocument.uri];
    if (request) {
        clearTimeout(request);
        delete pendingValidationRequests[textDocument.uri];
    }
}
function triggerValidation(textDocument) {
    cleanPendingValidation(textDocument);
    pendingValidationRequests[textDocument.uri] = setTimeout(function () {
        delete pendingValidationRequests[textDocument.uri];
        validateTextDocument(textDocument);
    }, validationDelayMs);
}
function validateTextDocument(document) {
    var settingsPromise = getDocumentSettings(document);
    settingsPromise.then(function (settings) {
        var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
        if (styledJsx) {
            var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
            var diagnostics = cssLanguageService.doValidation(cssDocument, stylesheet, settings);
            connection.sendDiagnostics({ uri: document.uri, diagnostics: diagnostics });
        }
        else {
            clearDiagnostics(document);
        }
    });
}
connection.onCompletion(function (textDocumentPosition) {
    var document = documents.get(textDocumentPosition.textDocument.uri);
    var cursorOffset = document.offsetAt(textDocumentPosition.position);
    var styledJsx = styled_jsx_utils_1.getStyledJsxUnderCursor(document, stylesheets, cursorOffset);
    if (styledJsx) {
        var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
        return cssLanguageService.doComplete(cssDocument, textDocumentPosition.position, stylesheet);
    }
    return null;
});
connection.onHover(function (textDocumentPosition) {
    var document = documents.get(textDocumentPosition.textDocument.uri);
    var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
    if (styledJsx) {
        var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
        return cssLanguageService.doHover(cssDocument, textDocumentPosition.position, stylesheet);
    }
    return null;
});
connection.onDocumentSymbol(function (documentSymbolParams) {
    var document = documents.get(documentSymbolParams.textDocument.uri);
    var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
    if (styledJsx) {
        var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
        return cssLanguageService.findDocumentSymbols(cssDocument, stylesheet);
    }
    return null;
});
connection.onDefinition(function (documentSymbolParams) {
    var document = documents.get(documentSymbolParams.textDocument.uri);
    var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
    if (styledJsx) {
        var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
        return cssLanguageService.findDefinition(cssDocument, documentSymbolParams.position, stylesheet);
    }
    return null;
});
connection.onDocumentHighlight(function (documentSymbolParams) {
    var document = documents.get(documentSymbolParams.textDocument.uri);
    var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
    if (styledJsx) {
        var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
        return cssLanguageService.findDocumentHighlights(cssDocument, documentSymbolParams.position, stylesheet);
    }
    return null;
});
connection.onReferences(function (referenceParams) {
    var document = documents.get(referenceParams.textDocument.uri);
    var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
    if (styledJsx) {
        var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
        return cssLanguageService.findReferences(cssDocument, referenceParams.position, stylesheet);
    }
    return null;
});
connection.onCodeAction(function (codeActionParams) {
    var document = documents.get(codeActionParams.textDocument.uri);
    var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
    if (styledJsx) {
        var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
        return cssLanguageService.doCodeActions(cssDocument, codeActionParams.range, codeActionParams.context, stylesheet);
    }
    return null;
});
connection.onRequest(protocol_colorProvider_proposed_1.DocumentColorRequest.type, function (params) {
    var document = documents.get(params.textDocument.uri);
    if (document) {
        var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
        if (styledJsx) {
            var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
            return cssLanguageService.findDocumentColors(cssDocument, stylesheet);
        }
    }
    return [];
});
connection.onRequest(protocol_colorProvider_proposed_1.ColorPresentationRequest.type, function (params) {
    var document = documents.get(params.textDocument.uri);
    if (document) {
        var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
        if (styledJsx) {
            var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
            return cssLanguageService.getColorPresentations(cssDocument, stylesheet, params.color, params.range);
        }
    }
    return [];
});
connection.onRenameRequest(function (renameParameters) {
    var document = documents.get(renameParameters.textDocument.uri);
    var styledJsx = styled_jsx_utils_1.getStyledJsx(document, stylesheets);
    if (styledJsx) {
        var cssDocument = styledJsx.cssDocument, stylesheet = styledJsx.stylesheet;
        return cssLanguageService.doRename(cssDocument, renameParameters.position, renameParameters.newName, stylesheet);
    }
    return null;
});
// Listen on the connection
connection.listen();
