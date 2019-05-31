"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const utils_1 = require("./utils");
const common_1 = require("../common");
var RecordType;
(function (RecordType) {
    RecordType[RecordType["Register"] = 0] = "Register";
    RecordType[RecordType["Field"] = 1] = "Field";
})(RecordType = exports.RecordType || (exports.RecordType = {}));
class TreeNode extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue, node) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.node = node;
        this.command = {
            command: 'cortex-debug.registers.selectedNode',
            arguments: [node],
            title: 'Selected Node'
        };
    }
}
exports.TreeNode = TreeNode;
class BaseNode {
    constructor(recordType) {
        this.recordType = recordType;
        this.format = common_1.NumberFormat.Auto;
        this.expanded = false;
    }
    getChildren() { return []; }
    getTreeNode() { return null; }
    getCopyValue() { return null; }
    setFormat(format) {
        this.format = format;
    }
}
exports.BaseNode = BaseNode;
class RegisterNode extends BaseNode {
    constructor(name, index) {
        super(RecordType.Register);
        this.name = name;
        this.index = index;
        this.name = this.name;
        if (name.toUpperCase() === 'XPSR' || name.toUpperCase() === 'CPSR') {
            this.fields = [
                new FieldNode('Negative Flag (N)', 31, 1, this),
                new FieldNode('Zero Flag (Z)', 30, 1, this),
                new FieldNode('Carry or borrow flag (C)', 29, 1, this),
                new FieldNode('Overflow Flag (V)', 28, 1, this),
                new FieldNode('Saturation Flag (Q)', 27, 1, this),
                new FieldNode('GE', 16, 4, this),
                new FieldNode('Interrupt Number', 0, 8, this),
                new FieldNode('ICI/IT', 25, 2, this),
                new FieldNode('ICI/IT', 10, 6, this),
                new FieldNode('Thumb State (T)', 24, 1, this)
            ];
        }
        else if (name.toUpperCase() === 'CONTROL') {
            this.fields = [
                new FieldNode('FPCA', 2, 1, this),
                new FieldNode('SPSEL', 1, 1, this),
                new FieldNode('nPRIV', 0, 1, this)
            ];
        }
        this.currentValue = 0x00;
    }
    extractBits(offset, width) {
        return utils_1.extractBits(this.currentValue, offset, width);
    }
    getTreeNode() {
        let label = `${this.name} = `;
        switch (this.getFormat()) {
            case common_1.NumberFormat.Decimal:
                label += this.currentValue.toString();
                break;
            case common_1.NumberFormat.Binary:
                label += utils_1.binaryFormat(this.currentValue, 32, false, true);
                break;
            default:
                label += utils_1.hexFormat(this.currentValue, 8);
                break;
        }
        if (this.fields && this.fields.length > 0) {
            return new TreeNode(label, this.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed, 'register', this);
        }
        else {
            return new TreeNode(label, vscode.TreeItemCollapsibleState.None, 'register', this);
        }
    }
    getChildren() {
        return this.fields;
    }
    setValue(newValue) {
        this.currentValue = newValue;
    }
    getCopyValue() {
        switch (this.getFormat()) {
            case common_1.NumberFormat.Decimal:
                return this.currentValue.toString();
            case common_1.NumberFormat.Binary:
                return utils_1.binaryFormat(this.currentValue, 32);
            default:
                return utils_1.hexFormat(this.currentValue, 8);
        }
    }
    getFormat() {
        return this.format;
    }
    _saveState() {
        const settings = [];
        if (this.expanded || this.format !== common_1.NumberFormat.Auto) {
            settings.push({ node: this.name, format: this.format, expanded: this.expanded });
        }
        if (this.fields) {
            settings.push(...this.fields.map((c) => c._saveState()).filter((c) => c !== null));
        }
        return settings;
    }
}
exports.RegisterNode = RegisterNode;
class FieldNode extends BaseNode {
    constructor(name, offset, size, register) {
        super(RecordType.Field);
        this.name = name;
        this.offset = offset;
        this.size = size;
        this.register = register;
    }
    getTreeNode() {
        const value = this.register.extractBits(this.offset, this.size);
        let label = `${this.name} = `;
        switch (this.getFormat()) {
            case common_1.NumberFormat.Decimal:
                label += value.toString();
                break;
            case common_1.NumberFormat.Binary:
                label += utils_1.binaryFormat(value, this.size, false, true);
                break;
            case common_1.NumberFormat.Hexidecimal:
                label += utils_1.hexFormat(value, Math.ceil(this.size / 4), true);
                break;
            default:
                label += this.size >= 4 ? utils_1.hexFormat(value, Math.ceil(this.size / 4), true) : utils_1.binaryFormat(value, this.size, false, true);
                break;
        }
        return new TreeNode(label, vscode.TreeItemCollapsibleState.None, 'field', this);
    }
    getCopyValue() {
        const value = this.register.extractBits(this.offset, this.size);
        switch (this.getFormat()) {
            case common_1.NumberFormat.Decimal:
                return value.toString();
            case common_1.NumberFormat.Binary:
                return utils_1.binaryFormat(value, this.size);
            case common_1.NumberFormat.Hexidecimal:
                return utils_1.hexFormat(value, Math.ceil(this.size / 4), true);
            default:
                return this.size >= 4 ? utils_1.hexFormat(value, Math.ceil(this.size / 4), true) : utils_1.binaryFormat(value, this.size);
        }
    }
    getFormat() {
        if (this.format === common_1.NumberFormat.Auto) {
            return this.register.getFormat();
        }
        else {
            return this.format;
        }
    }
    _saveState() {
        return this.format !== common_1.NumberFormat.Auto
            ? {
                node: `${this.register.name}.${this.name}`,
                format: this.format
            }
            : null;
    }
}
exports.FieldNode = FieldNode;
class RegisterTreeProvider {
    constructor() {
        // tslint:disable-next-line:variable-name
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.loaded = false;
        this.registers = [];
        this.registerMap = {};
    }
    refresh() {
        if (vscode.debug.activeDebugSession) {
            if (!this.loaded) {
                vscode.debug.activeDebugSession.customRequest('read-register-list').then((data) => {
                    this.createRegisters(data);
                    this._refreshRegisterValues();
                });
            }
            else {
                this._refreshRegisterValues();
            }
        }
    }
    _refreshRegisterValues() {
        vscode.debug.activeDebugSession.customRequest('read-registers').then((data) => {
            data.forEach((reg) => {
                const index = parseInt(reg.number, 10);
                const value = parseInt(reg.value, 16);
                const regNode = this.registerMap[index];
                if (regNode) {
                    regNode.setValue(value);
                }
            });
            this._onDidChangeTreeData.fire();
        });
    }
    getTreeItem(element) {
        return element.node.getTreeNode();
    }
    createRegisters(regInfo) {
        this.registerMap = {};
        this.registers = [];
        regInfo.forEach((reg, idx) => {
            if (reg) {
                const rn = new RegisterNode(reg, idx);
                this.registers.push(rn);
                this.registerMap[idx] = rn;
            }
        });
        this.loaded = true;
        vscode.workspace.findFiles('.vscode/.cortex-debug.registers.state.json', null, 1).then((value) => {
            if (value.length > 0) {
                const fspath = value[0].fsPath;
                const data = fs.readFileSync(fspath, 'utf8');
                const settings = JSON.parse(data);
                settings.forEach((s) => {
                    if (s.node.indexOf('.') === -1) {
                        const register = this.registers.find((r) => r.name === s.node);
                        if (register) {
                            if (s.expanded) {
                                register.expanded = s.expanded;
                            }
                            if (s.format) {
                                register.setFormat(s.format);
                            }
                        }
                    }
                    else {
                        const [regname, fieldname] = s.node.split('.');
                        const register = this.registers.find((r) => r.name === regname);
                        if (register) {
                            const field = register.getChildren().find((f) => f.name === fieldname);
                            if (field && s.format) {
                                field.setFormat(s.format);
                            }
                        }
                    }
                });
                this._onDidChangeTreeData.fire();
            }
        }, (error) => {
        });
        this._onDidChangeTreeData.fire();
    }
    updateRegisterValues(values) {
        values.forEach((reg) => {
            const node = this.registerMap[reg.number];
            node.setValue(reg.value);
        });
        this._onDidChangeTreeData.fire();
    }
    getChildren(element) {
        if (this.loaded && this.registers.length > 0) {
            if (element) {
                return element.node.getChildren().map((c) => c.getTreeNode());
            }
            else {
                return this.registers.map((r) => r.getTreeNode());
            }
        }
        else if (!this.loaded) {
            return [new TreeNode('Not in active debug session.', vscode.TreeItemCollapsibleState.None, 'message', null)];
        }
        else {
            return [];
        }
    }
    _saveState(fspath) {
        const state = [];
        this.registers.forEach((r) => {
            state.push(...r._saveState());
        });
        fs.writeFileSync(fspath, JSON.stringify(state), { encoding: 'utf8', flag: 'w' });
    }
    debugSessionTerminated() {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const fspath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode', '.cortex-debug.registers.state.json');
            this._saveState(fspath);
        }
        this.loaded = false;
        this.registers = [];
        this.registerMap = {};
        this._onDidChangeTreeData.fire();
    }
    debugSessionStarted() {
        this.loaded = false;
        this.registers = [];
        this.registerMap = {};
        this._onDidChangeTreeData.fire();
    }
    debugStopped() {
        this.refresh();
    }
    debugContinued() {
    }
}
exports.RegisterTreeProvider = RegisterTreeProvider;
//# sourceMappingURL=registers.js.map