"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extractSelectionAnchor_1 = require("../utils/extractSelectionAnchor");
const codeMod = (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const ast = fileInfo.ast;
    const target = options.target;
    const path = target.thisOrClosest(j.JSXOpeningElement).firstPath();
    const jsxElement = path.parent.node;
    jsxElement.closingElement = j.jsxClosingElement(path.node.name);
    path.node.selfClosing = false;
    jsxElement.children = [j.jsxText(extractSelectionAnchor_1.SELECTION_ANCHOR)];
    return extractSelectionAnchor_1.extractSelectionAnchor(ast.toSource());
};
codeMod.canRun = (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const ast = fileInfo.ast;
    const target = options.target;
    let openingNode = null;
    for (const node of target.thisAndParents()) {
        if (j.JSXAttribute.check(node)) {
            // False if over an attribute
            return false;
        }
        if (j.JSXOpeningElement.check(node)) {
            openingNode = node;
            break;
        }
    }
    return Boolean(openingNode && openingNode.selfClosing);
};
codeMod.scope = 'cursor';
codeMod.title = 'Expand empty tag';
codeMod.description = '';
codeMod.detail = '';
module.exports = codeMod;
//# sourceMappingURL=jsx-expand-empty-tag.js.map