"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = __importStar(require("querystring"));
const github_1 = require("../github");
const PluginConfig_1 = require("./PluginConfig");
class Callback {
    constructor(config, auth) {
        this.config = config;
        this.auth = auth;
        this.github = new github_1.GithubClient(this.config);
        /**
         * After a successful OAuth authentication, GitHub redirects back to us.
         * We use the OAuth code to get an OAuth access token and the username associated
         * with the GitHub account.
         *
         * The token and username are encryped and base64 encoded and configured as npm
         * credentials for this registry. There is no need to later decode and decrypt the token.
         * This process is automatically reversed before the token is passed to the authenticate
         * middleware.
         *
         * We then issue a JWT token using these values and pass them back to the frontend
         * as query parameters so they can be stored in the browser.
         */
        this.middleware = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const code = req.query.code;
                const clientId = PluginConfig_1.getConfig(this.config, "client-id");
                const clientSecret = PluginConfig_1.getConfig(this.config, "client-secret");
                const githubOauth = yield this.github.requestAccessToken(code, clientId, clientSecret);
                const githubUser = yield this.github.requestUser(githubOauth.access_token);
                const githubOrgs = yield this.github.requestUserOrgs(githubOauth.access_token);
                const githubOrgNames = githubOrgs.map(org => org.login);
                const npmAuth = githubUser.login + ":" + githubOauth.access_token;
                const npmAuthEncrypted = this.auth.aesEncrypt(new Buffer(npmAuth)).toString("base64");
                const frontendUser = {
                    name: githubUser.login,
                    real_groups: githubOrgNames,
                };
                const frontendToken = this.auth.issueUIjwt(frontendUser);
                const frontendUrl = "/?" + querystring.stringify({
                    jwtToken: frontendToken,
                    npmToken: npmAuthEncrypted,
                    username: githubUser.login,
                });
                res.redirect(frontendUrl);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
Callback.path = "/-/oauth/callback";
exports.Callback = Callback;
//# sourceMappingURL=Callback.js.map