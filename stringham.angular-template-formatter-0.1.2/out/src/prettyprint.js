"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("@angular/compiler");
function formatElementName(name) {
    return name.replace(/^:svg:/, '');
}
function format(src, indentation = 4, useSpaces = true, closeTagSameLine = false) {
    const rawHtmlParser = new compiler_1.HtmlParser();
    const htmlParser = new compiler_1.I18NHtmlParser(rawHtmlParser);
    const expressionParser = new compiler_1.Parser(new compiler_1.Lexer());
    const config = new compiler_1.CompilerConfig();
    const parser = new compiler_1.TemplateParser(config, expressionParser, new compiler_1.DomElementSchemaRegistry(), htmlParser, null, []);
    const htmlResult = htmlParser.parse(src, '', true);
    let pretty = [];
    let indent = 0;
    let attrNewLines = false;
    if (htmlResult.errors && htmlResult.errors.length > 0) {
        return src;
    }
    const selfClosing = {
        'area': true,
        'base': true,
        'br': true,
        'col': true,
        'command': true,
        'embed': true,
        'hr': true,
        'img': true,
        'input': true,
        'keygen': true,
        'link': true,
        'meta': true,
        'param': true,
        'source': true,
        'track': true,
        'wbr': true,
    };
    const skipFormattingChildren = {
        'style': true,
        'pre': true,
    };
    const detectedDoctype = src.match(/^\s*<!DOCTYPE((.|\n|\r)*?)>/i);
    if (detectedDoctype) {
        pretty.push(detectedDoctype[0].trim());
    }
    let getIndent = (i) => {
        if (useSpaces) {
            return new Array(i * indentation).fill(' ').join('');
        }
        else {
            return new Array(i).fill('\t').join('');
        }
    };
    function getFromSource(parseLocation) {
        return parseLocation.start.file.content.substring(parseLocation.start.offset, parseLocation.end.offset);
    }
    let visitor = {
        visitElement: function (element) {
            if (pretty.length > 0) {
                pretty.push('\n');
            }
            pretty.push(getIndent(indent) + '<' + formatElementName(element.name));
            attrNewLines = element.attrs.length > 1 && element.name != 'link';
            element.attrs.forEach(attr => {
                attr.visit(visitor, {});
            });
            if (!closeTagSameLine && attrNewLines) {
                pretty.push('\n' + getIndent(indent));
            }
            pretty.push('>');
            indent++;
            let ctx = {
                inlineTextNode: false,
                textNodeInlined: false,
                skipFormattingChildren: skipFormattingChildren.hasOwnProperty(element.name),
            };
            if (!attrNewLines && element.children.length == 1) {
                ctx.inlineTextNode = true;
            }
            element.children.forEach(element => {
                element.visit(visitor, ctx);
            });
            indent--;
            if (element.children.length > 0 && !ctx.textNodeInlined && !ctx.skipFormattingChildren) {
                pretty.push('\n' + getIndent(indent));
            }
            if (!selfClosing.hasOwnProperty(element.name)) {
                pretty.push(`</${formatElementName(element.name)}>`);
            }
        },
        visit: function (node, context) {
            console.error('IF YOU SEE THIS THE PRETTY PRINTER NEEDS TO BE UPDATED');
        },
        visitAttribute: function (attribute, context) {
            let prefix = attrNewLines ? '\n' + getIndent(indent + 1) : ' ';
            pretty.push(prefix + attribute.name);
            if (attribute.value.length) {
                const value = getFromSource(attribute.valueSpan);
                pretty.push(`=${value.trim()}`);
            }
        },
        visitComment: function (comment, context) {
            pretty.push('\n' + getIndent(indent) + '<!-- ' + comment.value.trim() + ' -->');
        },
        visitExpansion: function (expansion, context) {
            console.error('IF YOU SEE THIS THE PRETTY PRINTER NEEDS TO BE UPDATED');
        },
        visitExpansionCase: function (expansionCase, context) {
            console.error('IF YOU SEE THIS THE PRETTY PRINTER NEEDS TO BE UPDATED');
        },
        visitText: function (text, context) {
            const value = getFromSource(text.sourceSpan);
            if (context.skipFormattingChildren) {
                pretty.push(value);
                return;
            }
            let shouldInline = context.inlineTextNode && value.trim().length < 40 &&
                value.trim().length + pretty[pretty.length - 1].length < 140;
            context.textNodeInlined = shouldInline;
            if (value.trim().length > 0) {
                let prefix = shouldInline ? '' : '\n' + getIndent(indent);
                pretty.push(prefix + value.trim());
            }
            else if (!shouldInline) {
                pretty.push(value.replace('\n', '').replace(/ /g, '').replace(/\t/g, '').replace(/\n+/, '\n'));
            }
        }
    };
    htmlResult.rootNodes.forEach(node => {
        node.visit(visitor, {});
    });
    return pretty.join('').trim() + '\n';
}
exports.format = format;
//# sourceMappingURL=prettyprint.js.map