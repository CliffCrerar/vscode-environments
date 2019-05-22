"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge = require("lodash.merge");
exports.getWorkspaceColorDefinitions = (wsColors, config, options) => {
    config = merge({}, config);
    wsColors.forEach(wsColor => {
        let setColor;
        if (options.materialize) {
            setColor = wsColor.materialize ? "#0000" /* Transparent */ : wsColor.color;
        }
        else {
            setColor = wsColor.color;
        }
        config = merge({}, config, setColorDefinition(wsColor.scope, setColor));
    });
    return config;
};
const setColorDefinition = (wsScope, color = "#0000" /* Transparent */) => {
    const obj = { colors: {} };
    obj.colors[`${wsScope}`] = `${color}`;
    return obj;
};
//# sourceMappingURL=workspaceColorGenerator.js.map