"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicDir = "/-/static/github-oauth-ui";
const scriptTag = `<script src="${publicDir}/login-button.js"></script>`;
const styleTag = `<link href="${publicDir}/styles.css" rel="stylesheet">`;
const headWithStyle = [styleTag, "</head>"].join("");
const bodyWithScript = [scriptTag, "</body>"].join("");
/**
 * Injects additional tags into the DOM that modify the login button.
 */
class InjectHtml {
    constructor() {
        /**
         * Serves the injected style and script imports.
         */
        this.serveAssetsMiddleware = express_1.static(__dirname + "/../../client");
        /**
         * Monkey-patches `res.send` in order to inject style and script imports.
         */
        this.injectAssetsMiddleware = (req, res, next) => {
            const send = res.send;
            res.send = html => {
                html = this.insertImportTags(html);
                return send.call(res, html);
            };
            next();
        };
        this.insertImportTags = (html) => {
            html = String(html);
            if (!html.includes("VERDACCIO_API_URL")) {
                return html;
            }
            return html
                .replace(/<\/head>/, headWithStyle)
                .replace(/<\/body>/, bodyWithScript);
        };
    }
}
InjectHtml.path = "/-/static/github-oauth-ui";
exports.InjectHtml = InjectHtml;
//# sourceMappingURL=InjectHtml.js.map