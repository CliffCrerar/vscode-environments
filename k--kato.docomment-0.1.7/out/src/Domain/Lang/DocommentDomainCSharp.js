"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigAdvancedCSharp_1 = require("../../Entity/Config/Lang/ConfigAdvancedCSharp");
const FormatterCSharp_1 = require("../../Formatter/FormatterCSharp");
const SyntacticAnalysisCSharp_1 = require("../../SyntacticAnalysis/SyntacticAnalysisCSharp");
const StringUtil_1 = require("../../Utility/StringUtil");
const DocommentDomain_1 = require("../DocommentDomain");
const IDocommentDomain_1 = require("../IDocommentDomain");
class DocommentDomainCSharp extends DocommentDomain_1.DocommentDomain {
    constructor() {
        super(...arguments);
        /*-------------------------------------------------------------------------
         * Field
         *-----------------------------------------------------------------------*/
        this._isEnterKey = false;
    }
    /*-------------------------------------------------------------------------
     * Domain Method
     *-----------------------------------------------------------------------*/
    /* @override */
    IsTriggerDocomment() {
        // NG: KeyCode is EMPTY
        const eventText = this._event.text;
        if (eventText == null || eventText === '') {
            return false;
        }
        // NG: ActiveChar is NULL
        const activeChar = this._vsCodeApi.ReadCharAtCurrent();
        if (activeChar == null) {
            return false;
        }
        // NG: KeyCode is NOT '/' or Enter
        const isActivationKey = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsActivationKey(activeChar, this._config.syntax);
        const isEnterKey = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsEnterKey(activeChar, eventText);
        if (!isActivationKey && !isEnterKey) {
            return false;
        }
        this._isEnterKey = isEnterKey;
        // NG: Activate on Enter NOT '/'
        if (this._config.activateOnEnter) {
            if (isActivationKey) {
                return false;
            }
        }
        // NG: '////'
        const activeLine = this._vsCodeApi.ReadLineAtCurrent();
        if (isActivationKey) {
            // NG: '////'
            if (!SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsDocCommentStrict(activeLine, this._config.syntax)) {
                return false;
            }
            // NG: '/' => Insert => Event => ' /// '
            if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsDoubleDocComment(activeLine, this._config.syntax)) {
                return false;
            }
        }
        // Comment Line
        if (isEnterKey) {
            if (this._config.activateOnEnter) {
                // NG: '////'
                if (!SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsDocCommentOnActivationEnter(activeLine, this._config.syntax)) {
                    return false;
                }
            }
            // NG: '////'
            else if (!SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsDocComment(activeLine, this._config.syntax)) {
                return false;
            }
        }
        // OK
        return true;
    }
    /* @override */
    GetCode() {
        const code = this._vsCodeApi.ReadNextCodeFromCurrent(this._config.eol);
        const removedAttr = code.split(this._config.eol).filter(line => !SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsAttribute(line.trim())).join('');
        return removedAttr;
    }
    /* @override */
    GetCodeType(code) {
        // If the previous line was a doc comment and we hit enter.
        // Extend the doc comment without generating anything else,
        // even if there's a method or something next line.
        if (!this._config.activateOnEnter && this._isEnterKey && SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsDocComment(this._vsCodeApi.ReadLineAtCurrent(), this._config.syntax)) {
            return IDocommentDomain_1.CodeType.Comment;
        }
        /* namespace */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsNamespace(code))
            return IDocommentDomain_1.CodeType.Namespace;
        /* class */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsClass(code))
            return IDocommentDomain_1.CodeType.Class;
        /* interface */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsInterface(code))
            return IDocommentDomain_1.CodeType.Interface;
        /* struct */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsStruct(code))
            return IDocommentDomain_1.CodeType.Struct;
        /* enum */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsEnum(code))
            return IDocommentDomain_1.CodeType.Enum;
        /* delegate */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsDelegate(code))
            return IDocommentDomain_1.CodeType.Delegate;
        /* event */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsEvent(code))
            return IDocommentDomain_1.CodeType.Event;
        /* method */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsMethod(code))
            return IDocommentDomain_1.CodeType.Method;
        /* property */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsProperty(code))
            return IDocommentDomain_1.CodeType.Property;
        /* field */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsField(code))
            return IDocommentDomain_1.CodeType.Field;
        /* comment */
        if (SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.IsComment(code))
            return IDocommentDomain_1.CodeType.Comment;
        return IDocommentDomain_1.CodeType.None;
    }
    /* @override */
    GeneDocomment(code, codeType) {
        let genericList = null;
        let paramNameList = null;
        let hasReturn = false;
        let hasValue = false;
        switch (codeType) {
            case IDocommentDomain_1.CodeType.Namespace:
                break;
            case IDocommentDomain_1.CodeType.Class:
                genericList = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetGenericList(code);
                break;
            case IDocommentDomain_1.CodeType.Interface:
                genericList = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetGenericList(code);
                break;
            case IDocommentDomain_1.CodeType.Struct:
                break;
            case IDocommentDomain_1.CodeType.Enum:
                break;
            case IDocommentDomain_1.CodeType.Delegate:
                genericList = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetGenericMethodsList(code);
                paramNameList = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetMethodParamNameList(code);
                hasReturn = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.HasMethodReturn(code);
                break;
            case IDocommentDomain_1.CodeType.Event:
                break;
            case IDocommentDomain_1.CodeType.Method:
                genericList = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetGenericMethodsList(code);
                paramNameList = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetMethodParamNameList(code);
                hasReturn = SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.HasMethodReturn(code);
                break;
            case IDocommentDomain_1.CodeType.Field:
                break;
            case IDocommentDomain_1.CodeType.Property:
                hasValue = true;
                break;
            case IDocommentDomain_1.CodeType.Comment:
                return SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetCommentSyntax(this._config.syntax) + ' ';
            case IDocommentDomain_1.CodeType.None:
                return '';
            default:
                return '';
        }
        return this.GeneSummary(code, codeType, genericList, paramNameList, hasReturn, hasValue);
    }
    /* @implements */
    WriteDocomment(code, codeType, docomment) {
        const position = this._vsCodeApi.GetActivePosition();
        if (codeType === IDocommentDomain_1.CodeType.Comment) {
            const indentBaseLine = this._vsCodeApi.ReadPreviousLineFromCurrent();
            const indent = StringUtil_1.StringUtil.GetIndent(code, indentBaseLine, this._config.insertSpaces, this._config.detectIdentation);
            const indentLen = StringUtil_1.StringUtil.GetIndentLen(indent, this._config.insertSpaces, this._config.detectIdentation);
            const insertPosition = this._vsCodeApi.GetPosition(position.line + 1, indentLen - 1);
            this._vsCodeApi.InsertText(insertPosition, docomment);
        }
        else {
            if (this._isEnterKey) {
                const active = this._vsCodeApi.GetActivePosition();
                const anchor = this._vsCodeApi.GetPosition(active.line + 1, active.character);
                const replaceSelection = this._vsCodeApi.GetSelectionByPosition(anchor, active);
                this._vsCodeApi.ReplaceText(replaceSelection, docomment);
            }
            else {
                const insertPosition = this._vsCodeApi.ShiftPositionChar(position, 1);
                this._vsCodeApi.InsertText(insertPosition, docomment);
            }
        }
    }
    /* @implements */
    MoveCursorTo(code, codeType, docomment) {
        const curPosition = this._vsCodeApi.GetActivePosition();
        const indentBaseLine = this._vsCodeApi.ReadLineAtCurrent();
        const indent = StringUtil_1.StringUtil.GetIndent(code, indentBaseLine, this._config.insertSpaces, this._config.detectIdentation);
        const indentLen = StringUtil_1.StringUtil.GetIndentLen(indent, this._config.insertSpaces, this._config.detectIdentation);
        const line = curPosition.line + SyntacticAnalysisCSharp_1.SyntacticAnalysisCSharp.GetLineOffset(this._config.syntax, codeType);
        const character = indentLen - 1 + docomment.length;
        this._vsCodeApi.MoveSelection(line, character);
    }
    /*-------------------------------------------------------------------------
     * Private Method
     *-----------------------------------------------------------------------*/
    GeneSummary(code, codeType, genericList, paramNameList, hasReturn, hasValue) {
        let docommentList = new Array();
        if (ConfigAdvancedCSharp_1.ConfigAdvancedCSharp.HasAttribute(this._config.advanced, codeType, ConfigAdvancedCSharp_1.Attribute.summary)) {
            /* <summary> */
            docommentList.push('<summary>');
            docommentList.push('');
            docommentList.push('</summary>');
        }
        /* <param> */
        if (ConfigAdvancedCSharp_1.ConfigAdvancedCSharp.HasAttribute(this._config.advanced, codeType, ConfigAdvancedCSharp_1.Attribute.param)) {
            if (paramNameList !== null) {
                paramNameList.forEach(name => {
                    docommentList.push('<param name="' + name + '"></param>');
                });
            }
        }
        /* <typeparam> */
        if (ConfigAdvancedCSharp_1.ConfigAdvancedCSharp.HasAttribute(this._config.advanced, codeType, ConfigAdvancedCSharp_1.Attribute.typeparam)) {
            if (genericList !== null) {
                genericList.forEach(name => {
                    docommentList.push('<typeparam name="' + name + '"></typeparam>');
                });
            }
        }
        /* <returns> */
        if (ConfigAdvancedCSharp_1.ConfigAdvancedCSharp.HasAttribute(this._config.advanced, codeType, ConfigAdvancedCSharp_1.Attribute.returns)) {
            if (hasReturn) {
                docommentList.push('<returns></returns>');
            }
        }
        /* <value> */
        if (ConfigAdvancedCSharp_1.ConfigAdvancedCSharp.HasAttribute(this._config.advanced, codeType, ConfigAdvancedCSharp_1.Attribute.value)) {
            if (hasValue) {
                docommentList.push('<value></value>');
            }
        }
        // Format
        const indentBaseLine = this._vsCodeApi.ReadLineAtCurrent();
        const indent = StringUtil_1.StringUtil.GetIndent(code, indentBaseLine, this._config.insertSpaces, this._config.detectIdentation);
        const docomment = FormatterCSharp_1.FormatterCSharp.Format(docommentList, indent, this._config.syntax, this._config.activateOnEnter);
        return docomment;
    }
}
exports.DocommentDomainCSharp = DocommentDomainCSharp;
//# sourceMappingURL=DocommentDomainCSharp.js.map