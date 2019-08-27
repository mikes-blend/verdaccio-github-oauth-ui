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
const got_1 = __importDefault(require("got"));
const lodash_1 = require("lodash");
const PluginConfig_1 = require("../plugin/PluginConfig");
class GithubClient {
    constructor(config) {
        this.config = config;
        this.defaultOptions = {
            headers: {
                "User-Agent": this.config.user_agent,
            },
            json: true,
        };
        /**
         * `POST /login/oauth/access_token`
         *
         * [Web application flow](https://bit.ly/2mNSppX).
         */
        this.requestAccessToken = (code, clientId, clientSecret) => __awaiter(this, void 0, void 0, function* () {
            const url = `${PluginConfig_1.getConfig(this.config, "github-login-hostname")}/login/oauth/access_token`;
            const options = {
                body: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                },
                json: true,
            };
            return this.request(url, options);
        });
        /**
         * `GET /user`
         *
         * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
         */
        this.requestUser = (accessToken) => __awaiter(this, void 0, void 0, function* () {
            const url = `${PluginConfig_1.getConfig(this.config, "github-api-url-base")}/user`;
            const options = {
                headers: {
                    Authorization: "Bearer " + accessToken,
                },
                json: true,
            };
            return this.request(url, options);
        });
        /**
         * `GET /user/orgs`
         *
         * [List your organizations](https://developer.github.com/v3/orgs/#list-your-organizations)
         */
        this.requestUserOrgs = (accessToken) => __awaiter(this, void 0, void 0, function* () {
            const url = `${PluginConfig_1.getConfig(this.config, "github-api-url-base")}/user/orgs`;
            const options = {
                headers: {
                    Authorization: "Bearer " + accessToken,
                },
                json: true,
            };
            return this.request(url, options);
        });
    }
    request(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = lodash_1.merge({}, this.defaultOptions, options);
            const response = yield got_1.default(url, options);
            return response.body;
        });
    }
}
exports.GithubClient = GithubClient;
//# sourceMappingURL=GithubClient.js.map