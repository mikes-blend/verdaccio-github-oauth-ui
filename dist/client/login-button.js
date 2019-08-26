"use strict";
(function () {
    /**
     * Displays what the user needs to run in order to authenticate using npm.
     */
    var getUsageInfo = function () {
        var username = localStorage.getItem("username");
        if (!username) {
            return [];
        }
        var configBase = "//" + location.host + location.pathname;
        var authToken = localStorage.getItem("npm");
        return [
            "npm config set " + configBase + ":_authToken \"" + authToken + "\"",
            "npm config set " + configBase + ":always-auth true",
        ];
    };
    var updateUsageInfo = function () {
        var info = getUsageInfo();
        var element = document.querySelector("[class*='header__headerWrap'] figure");
        if (element) {
            element.innerText = info.join("\n");
        }
        else {
            setTimeout(updateUsageInfo, 100);
        }
    };
    //
    // By default the login button opens a form that asks the user to submit credentials.
    // We replace this behaviour and instead redirect to the route that handles OAuth.
    //
    var clickTargetHasClassname = function (classname, e) {
        var path = e.path || (e.composedPath && e.composedPath());
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var element = path_1[_i];
            if (element.classList && element.classList.contains(classname)) {
                return true;
            }
        }
        return false;
    };
    var interruptClick = function (classname, callback) {
        var handleClick = function (e) {
            if (clickTargetHasClassname(classname, e)) {
                callback(e);
            }
        };
        var useCapture = true;
        document.addEventListener("click", handleClick, useCapture);
    };
    interruptClick("header-button-login", function (e) {
        e.preventDefault();
        e.stopPropagation();
        location.href = "/-/oauth/authorize";
    });
    interruptClick("header-button-logout", function (e) {
        localStorage.removeItem("username");
        localStorage.removeItem("token");
        localStorage.removeItem("npm");
        updateUsageInfo();
    });
    /**
     * After a successful login we are redirected to the UI with our GitHub username
     * and a JWT token. We need to save these in local storage in order for Verdaccio
     * to remember that we are logged in.
     *
     * Also replaces the default npm usage info and displays the authToken that needs
     * to be configured.
     */
    var saveCredentials = function (query) {
        localStorage.setItem("username", query.username);
        localStorage.setItem("token", query.jwtToken);
        localStorage.setItem("npm", query.npmToken);
    };
    var credentialsAreSaved = function () {
        return localStorage.getItem("username")
            && !!localStorage.getItem("token")
            && !!localStorage.getItem("npm");
    };
    /**
     * Returns `?a=b&c` as `{ a: b, c: true }`.
     */
    var parseQueryParams = function () {
        return (location.search || "?")
            .substring(1)
            .split("&")
            .filter(function (kv) { return kv; })
            .map(function (kv) { return kv.split("=").concat(["true"]); })
            .reduce(function (obj, pair) {
            obj[pair[0]] = decodeURIComponent(pair[1]);
            return obj;
        }, {});
    };
    var removeQueryParams = function () {
        history.replaceState(null, "", location.pathname);
        location.reload();
    };
    /**
     * Saves query parameters in local storage and removes them from the URL.
     */
    var handleQueryParams = function () {
        if (credentialsAreSaved()) {
            return;
        }
        var query = parseQueryParams();
        if (!query.username || !query.jwtToken) {
            return;
        }
        saveCredentials(query);
        removeQueryParams();
    };
    handleQueryParams();
    updateUsageInfo();
})();
//# sourceMappingURL=login-button.js.map