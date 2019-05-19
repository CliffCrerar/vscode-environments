"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var vscode_languageserver_types_1 = require("vscode-languageserver-types");
var styledJsxPattern = /(<style[\>]*>)/g;
function getApproximateStyledJsxOffsets(document) {
    var results = [];
    var doc = document.getText();
    while (styledJsxPattern.exec(doc)) {
        results.push(styledJsxPattern.lastIndex);
    }
    return results;
}
exports.getApproximateStyledJsxOffsets = getApproximateStyledJsxOffsets;
// css`button { position: relative; }`
function isStyledJsxTaggedTemplate(token) {
    if (token.kind === ts.SyntaxKind.TaggedTemplateExpression) {
        if (token.tag.getText() === "css") {
            return true;
        }
    }
    return false;
}
exports.isStyledJsxTaggedTemplate = isStyledJsxTaggedTemplate;
// Is <style jsx/>. Maybe there is a better name for function
function isStyledJsxTag(token) {
    if (token.kind === ts.SyntaxKind.JsxElement) {
        var openingElement = token
            .openingElement;
        var closingElement = token
            .closingElement;
        // Check that opening and closing tags are 'style'
        if (openingElement.tagName.getText() === "style" &&
            closingElement.tagName.getText() === "style") {
            var nextToken = ts.findNextToken(openingElement, openingElement.parent);
            // Check if there is a '{'
            if (nextToken.kind === ts.SyntaxKind.FirstPunctuation) {
                var anotherNextToken = ts.findNextToken(nextToken, nextToken.parent);
                // Check if there is a beginning of the template string. This is neccessary to skip things like <style jsx>{styles}</style>
                if (anotherNextToken.kind === ts.SyntaxKind.FirstTemplateToken ||
                    anotherNextToken.kind === ts.SyntaxKind.TemplateHead) {
                    return true;
                }
            }
        }
    }
    return false;
}
exports.isStyledJsxTag = isStyledJsxTag;
function findStyledJsxTaggedTemplate(textDocument, cursorOffsets) {
    var source = ts.createSourceFile("tmp", textDocument.getText(), ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX | ts.ScriptKind.TSX);
    var result = [];
    for (var i = 0; i < cursorOffsets.length; i++) {
        var token = ts.getTokenAtPosition(source, cursorOffsets[i]);
        while (token) {
            if (isStyledJsxTaggedTemplate(token)) {
                result.push({
                    start: token.template.getStart() + 1,
                    end: token.template.getEnd() - 1 // escape `
                });
                break;
            }
            else if (isStyledJsxTag(token)) {
                result.push({
                    start: token.openingElement.getEnd() + 2,
                    end: token.closingElement.getStart() - 2 // escape `
                });
                break;
            }
            token = token.parent;
        }
    }
    return result;
}
exports.findStyledJsxTaggedTemplate = findStyledJsxTaggedTemplate;
var expressionPattern = /(.*\${.*}.*)|(.*(&&|[||]).*)/g;
// I guess so long functions are bad. Don't know how to properly format in typescript.
function replaceAllWithSpacesExceptCss(textDocument, styledJsxTaggedTemplates, stylesheets) {
    var text = textDocument.getText();
    var result = "";
    // code that goes before CSS
    result += text.slice(0, styledJsxTaggedTemplates[0].start).replace(/./g, " ");
    for (var i = 0; i < styledJsxTaggedTemplates.length; i++) {
        // CSS itself with dirty hacks. Maybe there is better solution.
        // We need to find all expressions in css and replace each character of expression with space.
        // This is neccessary to preserve character count
        result += text
            .slice(styledJsxTaggedTemplates[i].start, styledJsxTaggedTemplates[i].end)
            .replace(expressionPattern, function (str, p1) {
            return p1.replace(/./g, " ");
        });
        // if there is several CSS parts
        if (i + 1 < styledJsxTaggedTemplates.length) {
            // code that is in between that CSS parts
            result += text
                .slice(styledJsxTaggedTemplates[i].end, styledJsxTaggedTemplates[i + 1].start)
                .replace(/./g, " ");
        }
    }
    // code that goes after CSS
    result += text
        .slice(styledJsxTaggedTemplates[styledJsxTaggedTemplates.length - 1].end, text.length)
        .replace(/./g, " ");
    var cssDocument = vscode_languageserver_types_1.TextDocument.create(textDocument.uri.toString(), "css", textDocument.version, result);
    var stylesheet = stylesheets.get(cssDocument);
    return {
        cssDocument: cssDocument,
        stylesheet: stylesheet
    };
}
exports.replaceAllWithSpacesExceptCss = replaceAllWithSpacesExceptCss;
function getStyledJsx(document, stylesheets) {
    var styledJsxOffsets = getApproximateStyledJsxOffsets(document);
    if (styledJsxOffsets.length > 0) {
        var styledJsxTaggedTemplates = findStyledJsxTaggedTemplate(document, styledJsxOffsets);
        if (styledJsxTaggedTemplates.length > 0) {
            return replaceAllWithSpacesExceptCss(document, styledJsxTaggedTemplates, stylesheets);
        }
    }
    return undefined;
}
exports.getStyledJsx = getStyledJsx;
function getStyledJsxUnderCursor(document, stylesheets, cursorOffset) {
    var styledJsxTaggedTemplates = findStyledJsxTaggedTemplate(document, [
        cursorOffset
    ]);
    if (styledJsxTaggedTemplates.length > 0 &&
        styledJsxTaggedTemplates[0].start < cursorOffset &&
        styledJsxTaggedTemplates[0].end > cursorOffset) {
        return replaceAllWithSpacesExceptCss(document, styledJsxTaggedTemplates, stylesheets);
    }
    return undefined;
}
exports.getStyledJsxUnderCursor = getStyledJsxUnderCursor;
