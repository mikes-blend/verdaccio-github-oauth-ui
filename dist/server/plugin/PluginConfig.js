"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginName = "github-oauth-ui";
function getConfig(config, key) {
    const value = config.middlewares[exports.pluginName][key];
    return process.env[value] || value;
}
exports.getConfig = getConfig;
//# sourceMappingURL=PluginConfig.js.map