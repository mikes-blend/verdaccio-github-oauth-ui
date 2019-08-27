"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const querystring = __importStar(require("querystring"));
const Callback_1 = require("./Callback");
class Authorization {
    constructor(config) {
        this.config = config;
        /**
         * Initiates the GitHub OAuth flow by redirecting to GitHub.
         * The callback URL can be customized by subpathing the request.
         *
         * Example:
         *   A request to `/-/oauth/authorize/cheese-cake` will be called back at
         *   `/-/oauth/callback/cheese-cake`.
         */
        this.middleware = (req, res, next) => {
            const id = (req.params.id || "");
            const url = `${this.config["github-login-hostname"]}/login/oauth/authorize?` + querystring.stringify({
                client_id: process.env[this.config["client-id"]] || this.config["client-id"],
                redirect_uri: this.getRedirectUrl(req) + (id ? `/${id}` : ""),
                scope: "read:org",
            });
            res.redirect(url);
        };
    }
    /**
     * This is where GitHub should redirect back to.
     */
    getRedirectUrl(req) {
        return this.getRegistryUrl(req) + Callback_1.Callback.path;
    }
    /**
     * This is the same as what `npm config get registry` returns.
     */
    getRegistryUrl(req) {
        const prefix = lodash_1.get(this.config, "url_prefix", "");
        if (prefix) {
            return prefix.replace(/\/?$/, ""); // Remove potential trailing slash
        }
        const protocal = req.get("X-Forwarded-Proto") || req.protocol;
        return (protocal + "://" + req.get("host"));
    }
}
Authorization.path = "/-/oauth/authorize/:id?";
exports.Authorization = Authorization;
//# sourceMappingURL=Authorization.js.map