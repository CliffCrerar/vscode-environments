"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const astHelpers_1 = require("../utils/astHelpers");
const codeMod = (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const ast = fileInfo.ast;
    const target = options.target;
    const path = target.thisOrClosest(j.IfStatement).firstPath();
    const conStatement = astHelpers_1.getSingleStatement(j, path.node.consequent);
    const altStatement = astHelpers_1.getSingleStatement(j, path.node.alternate);
    const nextStatement = astHelpers_1.getNextStatementInBlock(j, path);
    let result;
    if (j.ReturnStatement.check(conStatement)) {
        // if-return-else
        const conExpr = conStatement.argument;
        let altExpr;
        if (altStatement) {
            altExpr = altStatement.argument;
        }
        else {
            altExpr = nextStatement.argument;
            path.parentPath.value.splice(path.parentPath.value.indexOf(nextStatement), 1);
        }
        result = j.returnStatement(j.conditionalExpression(path.node.test, conExpr, altExpr));
    }
    else {
        // if-else assignment
        const conExpr = conStatement.expression;
        const altExpr = altStatement.expression;
        const name = conExpr.left.name;
        result = j.expressionStatement(j.assignmentExpression('=', j.identifier(name), j.conditionalExpression(path.node.test, conExpr.right, altExpr.right)));
    }
    path.replace(result);
    const resultText = ast.toSource();
    return resultText;
};
codeMod.canRun = (fileInfo, api, options) => {
    const j = api.jscodeshift;
    const ast = fileInfo.ast;
    const target = options.target;
    const path = target.thisOrClosest(j.IfStatement).firstPath();
    if (!path) {
        return false;
    }
    const conStatement = astHelpers_1.getSingleStatement(j, path.node.consequent);
    const altStatement = astHelpers_1.getSingleStatement(j, path.node.alternate);
    if (!conStatement) {
        return false;
    }
    let isAssignmentToOneVar;
    const conIsReturn = j.ReturnStatement.check(conStatement) && conStatement.argument;
    let altIsReturn;
    if (altStatement) {
        // 1. AssignmentExpression in both branches
        const conName = j.ExpressionStatement.check(conStatement) &&
            j.AssignmentExpression.check(conStatement.expression) &&
            j.Identifier.check(conStatement.expression.left) &&
            conStatement.expression.left.name;
        const altName = j.ExpressionStatement.check(altStatement) &&
            j.AssignmentExpression.check(altStatement.expression) &&
            j.Identifier.check(altStatement.expression.left) &&
            altStatement.expression.left.name;
        isAssignmentToOneVar = Boolean(conName && altName && conName === altName);
        // 2.1 if () { return a; } else { return b; }
        altIsReturn = j.ReturnStatement.check(altStatement) && altStatement.argument;
    }
    else {
        // 2.2 if() { return a; } return b;
        const nextStatement = astHelpers_1.getNextStatementInBlock(j, path);
        altIsReturn = j.ReturnStatement.check(nextStatement) && nextStatement.argument;
    }
    const isIfElseReturn = Boolean(conIsReturn && altIsReturn);
    return isAssignmentToOneVar || isIfElseReturn;
};
codeMod.scope = 'cursor';
codeMod.title = 'Replace with ?:';
codeMod.description = '';
codeMod.detail = '';
module.exports = codeMod;
//# sourceMappingURL=replace-if-else-with-ternary.js.map