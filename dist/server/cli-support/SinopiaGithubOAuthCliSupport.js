"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("../github");
const PluginConfig_1 = require("../plugin/PluginConfig");
class SinopiaGithubOAuthCliSupport {
    constructor(config, stuff) {
        this.config = config;
        this.stuff = stuff;
        this.github = new github_1.GithubClient(this.config);
    }
    /**
     * Implements the middleware plugin interface.
     */
    register_middlewares(app, auth, storage) {
        app.use("/oauth/authorize", (req, res) => {
            res.redirect("/-/oauth/authorize/cli");
        });
        app.use("/-/oauth/callback/cli", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const code = req.query.code;
            const clientId = PluginConfig_1.getConfig(this.config, "client-id");
            const clientSecret = PluginConfig_1.getConfig(this.config, "client-secret");
            try {
                const oauth = yield this.github.requestAccessToken(code, clientId, clientSecret);
                const user = yield this.github.requestUser(oauth.access_token);
                const npmAuthPayload = user.login + ":" + oauth.access_token;
                const npmAuthToken = auth.aesEncrypt(new Buffer(npmAuthPayload)).toString("base64");
                res.redirect("http://localhost:8239?token=" + encodeURIComponent(npmAuthToken));
            }
            catch (error) {
                next(error);
            }
        }));
    }
}
exports.SinopiaGithubOAuthCliSupport = SinopiaGithubOAuthCliSupport;
//# sourceMappingURL=SinopiaGithubOAuthCliSupport.js.map