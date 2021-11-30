import { isAllowAnonymous, getLocalToken, verifyUID, refreshAnonymousToken, refreshToken, autoLogin, getCurrentToken, logged } from "./token";

let refreshPromise: Promise<any> | null, loginPromise: Promise<any> | null, anonymousPromise: Promise<any> | null;

export function isAnonymous() {
    return !getLocalToken();
}

export function isAuth() {
    return !!getLocalToken() || verifyUID();
}

if (isAllowAnonymous() && window.addEventListener) {
    window.addEventListener("load", () => refreshAnonymousToken());
}

export function refreshAnonymousTokens() {
    if (!anonymousPromise) {
        anonymousPromise = refreshAnonymousToken();

        anonymousPromise.finally(() => (anonymousPromise = null));
    }

    return anonymousPromise;
}

export function refreshTokens() {
    if (!refreshPromise) {
        refreshPromise = logged() ? refreshToken() : refreshAnonymousTokens();

        refreshPromise.finally(() => (refreshPromise = null));
    }

    return refreshPromise;
}

export function autoLogins() {
    if (!loginPromise) {
        loginPromise = autoLogin();

        loginPromise.finally(() => (loginPromise = null));
    }

    return loginPromise;
}

export function verifyAuth(allowAnonymous = false) {
    allowAnonymous = allowAnonymous || isAllowAnonymous();

    if (!!getCurrentToken() || allowAnonymous) return Promise.resolve(!0);

    return (allowAnonymous ? refreshAnonymousTokens : refreshTokens)().then(() => !!getCurrentToken());
}
