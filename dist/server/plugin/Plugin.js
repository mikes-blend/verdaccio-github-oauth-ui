"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const lodash_1 = require("lodash");
const cli_support_1 = require("../cli-support");
const github_1 = require("../github");
const Authorization_1 = require("./Authorization");
const Callback_1 = require("./Callback");
const InjectHtml_1 = require("./InjectHtml");
const PluginConfig_1 = require("./PluginConfig");
const cacheTTLms = 1000 * 30; // 30s
function log(...args) {
    console.log("[github-oauth-ui]", ...args);
}
/**
 * Implements the verdaccio plugin interfaces.
 */
class GithubOauthUiPlugin {
    constructor(config, stuff) {
        this.config = config;
        this.stuff = stuff;
        this.github = new github_1.GithubClient(this.config);
        this.cache = {};
        this.cliSupport = new cli_support_1.SinopiaGithubOAuthCliSupport(this.config, this.stuff);
        this.validateConfig(config);
    }
    /**
     * Implements the middleware plugin interface.
     */
    register_middlewares(app, auth, storage) {
        this.cliSupport.register_middlewares(app, auth, storage);
        if (lodash_1.get(this.config, "web.enable", true)) {
            const injectHtml = new InjectHtml_1.InjectHtml();
            app.use(injectHtml.injectAssetsMiddleware);
            app.use(InjectHtml_1.InjectHtml.path, injectHtml.serveAssetsMiddleware);
        }
        const authorization = new Authorization_1.Authorization(this.config);
        const callback = new Callback_1.Callback(this.config, auth);
        app.use(Authorization_1.Authorization.path, authorization.middleware);
        app.use(Callback_1.Callback.path, callback.middleware);
    }
    /**
     * Implements the auth plugin interface.
     */
    authenticate(username, authToken, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let details = this.cache[username];
            if (!details || details.authToken !== authToken || details.expires > Date.now()) {
                try {
                    const orgs = yield this.github.requestUserOrgs(authToken);
                    const orgNames = orgs.map(org => org.login);
                    details = this.cache[username] = {
                        authToken,
                        expires: Date.now() + cacheTTLms,
                        orgNames,
                    };
                }
                catch (error) {
                    log(error.message);
                }
            }
            const org = process.env[this.config.org] || this.config.org;
            if (details && details.orgNames.includes(org)) {
                cb(null, details.orgNames);
            }
            else {
                log(`Unauthenticated: user "${username}" is not a member of "${org}"`);
                cb(null, false);
            }
        });
    }
    allow_access(user, pkg, cb) {
        const requiredAccess = [...pkg.access || []];
        if (requiredAccess.includes("$authenticated")) {
            requiredAccess.push(this.config.auth[PluginConfig_1.pluginName].org);
        }
        const grantedAccess = lodash_1.intersection(user.groups, requiredAccess);
        if (grantedAccess.length === requiredAccess.length) {
            cb(null, user.groups);
        }
        else {
            log(`Access denied: user "${user.name}" is not a member of "${this.config.org}"`);
            cb(null, false);
        }
    }
    validateConfig(config) {
        this.validateConfigProp(config, `auth.${PluginConfig_1.pluginName}.org`);
        this.validateConfigProp(config, `middlewares.${PluginConfig_1.pluginName}.client-id`);
        this.validateConfigProp(config, `middlewares.${PluginConfig_1.pluginName}.client-secret`);
    }
    validateConfigProp(config, prop) {
        if (!lodash_1.get(config, prop)) {
            console.error(chalk_1.default.red(`[${PluginConfig_1.pluginName}] ERR: missing configuration "${prop}", please check your verdaccio config`));
            process.exit(1);
        }
    }
}
exports.default = GithubOauthUiPlugin;
//# sourceMappingURL=Plugin.js.map