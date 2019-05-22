"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vsc = require("vscode");
const ConfigurationKey = 'planner.azure-devops';
class Configuration {
    get onDidChange() {
        return this._onDidChange.event;
    }
    get isValid() {
        return !!this.organization && !!this.project && !!this.team && !!this.token;
    }
    constructor(logger) {
        this._onDidChange = new vsc.EventEmitter();
        this.load();
        logger.log('Configuration loaded');
        this._eventHandler = vsc.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration(ConfigurationKey)) {
                logger.log('Configuration reloaded');
                this.load();
                this._onDidChange.fire(this);
            }
        });
    }
    load() {
        const config = vsc.workspace.getConfiguration(ConfigurationKey);
        this.organization = config.get('organization');
        this.project = config.get('project');
        this.team = config.get('team');
        this.token = config.get('token');
        this.debug = config.get('debug', false);
        this.defaultActivity = config.get('default.activity');
    }
    dispose() {
        this._eventHandler.dispose();
        this._onDidChange.dispose();
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=config.js.map