import { encode, decode } from "base-64";

import { getObjectProp } from "../utils/get.object.prop";

import { httpRequest } from "./http.network";
import { HttpRequest } from "./http.request";
import { onLine } from "./utils";

const url = encode(getObjectProp(server, "url", "api")),
    anonymousTokenKey = `AnonymousToken_${url}`,
    tokenKey = `Token_${url}`,
    sidKey = `Sid_${url}`,
    rsidKey = `RSid_${url}`,
    UIDKey = `UID_${url}`,
    lastDateKey = `LastDate_${url}`,
    allowAnonymous = getObjectProp(server, "auth.anonymousLogin", true),
    logoutRouter = getObjectProp(client, "logoutRouter", "/login");

export function getLocalToken() {
    return sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);
}

export function logged() {
    return !!(getLocalToken() || verifyUID());
}

export function isAllowAnonymous() {
    return allowAnonymous;
}

export function getLocalAnonymousToken() {
    return isAllowAnonymous() ? sessionStorage.getItem(anonymousTokenKey) : null;
}

export function getCurrentToken() {
    return getLocalToken() || getLocalAnonymousToken();
}

function getRsid() {
    return sessionStorage.getItem(rsidKey) || localStorage.getItem(rsidKey);
}

function clearLocalToken() {
    [sidKey, rsidKey, tokenKey, lastDateKey].forEach((key) => (sessionStorage.removeItem(key), localStorage.removeItem(key)));
}

function clearUID() {
    localStorage.removeItem(UIDKey);
}

function refreshLocalToken(token, iskeep?: boolean) {
    const auth = (iskeep && clearLocalToken(), token),
        storage = iskeep ? localStorage : sessionStorage;

    (auth[tokenKey] || token[anonymousTokenKey]) && localStorage.setItem(lastDateKey, new Date().toDateString());

    Object.keys(auth).forEach((key) => storage.setItem(key, auth[key]));
}

function accessToken(params: any) {
    return httpRequest(
        new HttpRequest(`${server.url}${server.auth!.oauth2Url}/access_token`, {
            params: {
                ...params,
                client_id: server.apiKey!.apiKey,
                client_secret: server.apiKey!.secret,
            },
        })
    )
        .then((response: Response) => response.json())
        .then(transformToken);
}

function transformToken(token: any) {
    return { [tokenKey]: token.token_str, [sidKey]: token.access_token, [rsidKey]: token.refresh_token };
}

function getAnonymousToken() {
    return accessToken({ grant_type: "client_credentials" });
}

export function refreshAnonymousToken() {
    return isAllowAnonymous() ? getAnonymousToken().then((token) => refreshLocalToken({ [anonymousTokenKey]: token[tokenKey] }, !1)) : Promise.resolve({});
}

export function verifyUID() {
    return !!localStorage.getItem(UIDKey);
}

function verifyAutoLogin() {
    return server.auth!.autoLogin && verifyUID();
}

function getUID() {
    const uid = localStorage.getItem(UIDKey);

    return uid && JSON.parse(decode(uid));
}

function isTokenInvalid(_ = {} as any) {
    return !onLine();
}

function clearToken(_: any) {
    isTokenInvalid() && clearUID();
}

export function autoLogin() {
    return new Promise((resolve, reject) => {
        verifyAutoLogin()
            ? accessToken({ ...getUID(), grant_type: "password" }).then(
                  (token) => (refreshLocalToken(token, !0), resolve(token)),
                  (error) => (clearToken(error), reject(error))
              )
            : reject({ status: 401, errmsg: "请重新登录。" });
    });
}

export function refreshToken() {
    return new Promise((resolve, reject) => {
        const rsid = getRsid();

        (rsid
            ? accessToken({ refresh_token: rsid, grant_type: "refresh_token" }).then(
                  (token) => (refreshLocalToken(token, !0), token),
                  (error) => {
                      console.log("error", error);
                    // 已被禁用请重新登录
                    if (error.errcode === "ACCESS_TOKEN_INVALID") {
                        logoutAndJump()
                        return Promise.reject( {status: 401, errmsg: "请重新登录。" });
                    }
                    
                    return (onLine() ? autoLogin() : Promise.reject(error))
                  }
              )
            : autoLogin()
        ).then(resolve, reject);
    });
}

export function cycleRefreshToken() {
    if (server.auth!.autoRefreshToken) {
        const date = new Date().toDateString();

        if (localStorage.getItem(lastDateKey) === date) return;

        localStorage.setItem(lastDateKey, date);

        refreshAnonymousToken();
        refreshToken();
    }
}

export function refreshUID(uid: any) {
    uid ? localStorage.setItem(UIDKey, encode(JSON.stringify(uid))) : clearUID();
}

export function refreshSystemToken(token: any, iskeep?: boolean) {
    refreshLocalToken(transformToken(token), iskeep);
}

export function logout() {
    clearUID(), clearLocalToken(), refreshAnonymousToken();
}

export function logoutAndJump(jumpRouter?: string) {
    logout(), (location.hash = jumpRouter || logoutRouter);
}
