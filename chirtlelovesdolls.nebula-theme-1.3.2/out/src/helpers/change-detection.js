"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../themes/index");
const objects_1 = require("./objects");
const _1 = require(".");
const painter_1 = require("../../scripts/helpers/painter");
/** Compare the workspace and the user configurations with the current setup of the theme. */
exports.detectConfigChanges = () => {
    const configs = Object.keys(_1.getExtensionConfiguration())
        .map(c => c.split('.').slice(1).join('.'));
    return compareConfigs(configs).then(updatedOptions => {
        // if there's nothing to update
        if (!updatedOptions) {
            return;
        }
        // update theme json file with new options
        return index_1.createThemeFile(updatedOptions).then(() => {
            console.log(painter_1.green('New theme configuration file successfully created!'));
            _1.promptToReload();
        }).catch(err => {
            console.error(err);
        });
    });
};
/**
 * Compares a specific configuration in the settings with a current configuration state.
 * The current configuration state is read from the theme json file.
 * @param configs List of configuration names
 * @returns List of configurations that needs to be updated.
 */
const compareConfigs = (configs) => {
    let updateRequired = false;
    return _1.getColorThemeJson().then(json => {
        const defaults = index_1.getDefaultThemeOptions();
        configs.forEach(configName => {
            const configValue = _1.getThemeConfig(configName).globalValue;
            const currentState = objects_1.getObjectPropertyValue(json.options, configName);
            const configDefault = objects_1.getObjectPropertyValue(defaults, configName);
            // If property is deleted, and it wasn't the default value, set it to the default value
            if (configValue === undefined && currentState !== configDefault) {
                objects_1.setObjectPropertyValue(json.options, configName, configDefault);
                updateRequired = true;
            }
            else if (configValue !== undefined && currentState !== configValue) {
                objects_1.setObjectPropertyValue(json.options, configName, configValue);
                updateRequired = true;
            }
        });
        return updateRequired ? json.options : undefined;
    });
};
//# sourceMappingURL=change-detection.js.map