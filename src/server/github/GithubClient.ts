import got, { GotJSONOptions } from "got"
import { merge as deepAssign } from "lodash"

import { OAuth } from "./OAuth"
import { Organization } from "./Organization"
import { User } from "./User"
import {PluginConfig,getConfig} from "../plugin/PluginConfig";

export class GithubClient {

  private readonly defaultOptions = {
    headers: {
      "User-Agent": this.config.user_agent,
    },
    json: true,
  }

  constructor(
    private readonly config: PluginConfig,
  ) { }

  /**
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](https://bit.ly/2mNSppX).
   */
  requestAccessToken = async (code: string, clientId: string, clientSecret: string) => {
    const url = `${getConfig(this.config,"github-login-hostname")}/login/oauth/access_token`
    const options: GotJSONOptions = {
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      json: true,
    }
    return this.request<OAuth>(url, options)
  }

  /**
   * `GET /user`
   *
   * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
   */
  requestUser = async (accessToken: string) => {
    const url = `${getConfig(this.config, "github-api-url-base")}/user`
    const options: GotJSONOptions = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      json: true,
    }
    return this.request<User>(url, options)
  }

  /**
   * `GET /user/orgs`
   *
   * [List your organizations](https://developer.github.com/v3/orgs/#list-your-organizations)
   */
  requestUserOrgs = async (accessToken: string) => {
    const url = `${getConfig(this.config, "github-api-url-base")}/user/orgs`
    const options: GotJSONOptions = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      json: true,
    }
    return this.request<Organization[]>(url, options)
  }

  private async request<T>(url: string, options: GotJSONOptions): Promise<T> {
    options = deepAssign({}, this.defaultOptions, options)
    const response = await got(url, options)
    return response.body
  }

}
