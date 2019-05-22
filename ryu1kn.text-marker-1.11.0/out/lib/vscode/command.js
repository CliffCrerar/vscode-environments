"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../commands/command");
class CommandComponent {
    constructor(commands, logger) {
        this.commands = commands;
        this.logger = logger;
    }
    registerCommand(item) {
        const registerer = this.getCommandRegisterer(item.type);
        const commandWrapper = new command_1.ManualTriggerCommand(item.name, item.command, this.logger);
        return registerer(item.name, commandWrapper.execute, commandWrapper);
    }
    getCommandRegisterer(type) {
        return type === 'GENERAL' ?
            this.commands.registerCommand :
            this.commands.registerTextEditorCommand;
    }
}
exports.default = CommandComponent;
//# sourceMappingURL=command.js.map