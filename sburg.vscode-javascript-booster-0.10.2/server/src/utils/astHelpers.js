"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function negateExpression(j, expr) {
    // 1. !a => a
    if (j.match(expr, { type: 'UnaryExpression', operator: '!' })) {
        return expr.argument;
    }
    // 2. invert binary operators
    const operatorMap = {
        '<': '>=',
        '>': '<=',
        '>=': '<',
        '<=': '>',
        '!=': '==',
        '==': '!=',
        '!==': '===',
        '===': '!=='
    };
    if (j.BinaryExpression.check(expr) && operatorMap[expr.operator]) {
        expr.operator = operatorMap[expr.operator];
        return expr;
    }
    // Fallback: a => !a
    return j.unaryExpression('!', expr);
}
exports.negateExpression = negateExpression;
/**
 * Checks if the asked node is a StringLiteral AND also checks
 * if it's a proper string inside a JS expression, not inside imports, TS string Enums etc.
 */
function isStringExpression(j, path) {
    if (!path || !j.StringLiteral.check(path.node)) {
        return false;
    }
    const parentNode = path.parent && path.parent.node;
    if (j.ImportDeclaration.check(parentNode) ||
        j.JSXAttribute.check(parentNode) ||
        j.TSEnumMember.check(parentNode) ||
        ((j.ObjectProperty.check(parentNode) || j.ObjectMethod.check(parentNode)) &&
            parentNode.key === path.node)) {
        return false;
    }
    return true;
}
exports.isStringExpression = isStringExpression;
/**
 * When node is one of these: `expression;`, `{ expression; }`, `{ { expression; } }` etc.
 *
 * Returns `expression`.
 *
 * Otherwise, `null`.
 *
 * Useful e.g. when you want to get the content of `if` consequent branch etc.
 * @param j codeshift
 * @param n node to check
 */
function getSingleStatement(j, n) {
    if (j.BlockStatement.check(n) && n.body.length === 1) {
        return getSingleStatement(j, n.body[0]);
    }
    if (j.Statement.check(n)) {
        return n;
    }
    return null;
}
exports.getSingleStatement = getSingleStatement;
/**
 * When given the following example:
 * ```
 * {
 *     //...
 *     thisStatement;
 *     nextStatement;
 *     //...
 * }
 * ```
 * Returns the `nextStatement` or `null` if not inside a block, target is the last statement etc.
 * @param j codeshift
 * @param p path to work with
 */
function getNextStatementInBlock(j, p) {
    if (!p.parent || !j.BlockStatement.check(p.parent.node)) {
        return null;
    }
    const blockBody = p.parent.node.body;
    const index = blockBody.indexOf(p.node);
    if (index !== -1 && index + 1 < blockBody.length) {
        return blockBody[index + 1];
    }
    return null;
}
exports.getNextStatementInBlock = getNextStatementInBlock;
//# sourceMappingURL=astHelpers.js.map