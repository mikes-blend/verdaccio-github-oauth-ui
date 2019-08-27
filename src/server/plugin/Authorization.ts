import { Handler, Request, Response } from "express"
import { get } from "lodash"
import * as querystring from "querystring"

import { Callback } from "./Callback"
import { PluginConfig, getConfig } from "./PluginConfig"

export class Authorization {

  static readonly path = "/-/oauth/authorize/:id?"

  constructor(
    private readonly config: PluginConfig,
  ) { }

  /**
   * Initiates the GitHub OAuth flow by redirecting to GitHub.
   * The callback URL can be customized by subpathing the request.
   *
   * Example:
   *   A request to `/-/oauth/authorize/cheese-cake` will be called back at
   *   `/-/oauth/callback/cheese-cake`.
   */
  middleware: Handler = (req: Request, res: Response, next) => {
    const id = (req.params.id || "")
    const url = `${getConfig(this.config, "github-login-hostname")}/login/oauth/authorize?` + querystring.stringify({
      client_id: getConfig(this.config, "client-id"),
      redirect_uri: this.getRedirectUrl(req) + (id ? `/${id}` : ""),
      scope: "read:org",
    })
    res.redirect(url)
  }

  /**
   * This is where GitHub should redirect back to.
   */
  getRedirectUrl(req: Request): string {
    return this.getRegistryUrl(req) + Callback.path
  }

  /**
   * This is the same as what `npm config get registry` returns.
   */
  getRegistryUrl(req: Request): string {
    const prefix = get(this.config, "url_prefix", "")
    if (prefix) {
      return prefix.replace(/\/?$/, "") // Remove potential trailing slash
    }
    const protocal = req.get("X-Forwarded-Proto") || req.protocol
    return (protocal + "://" + req.get("host"))
  }

}
