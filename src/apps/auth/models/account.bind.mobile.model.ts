import { routerRedux } from "dva";
import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, getStorageObject, setLocalStorage, getLocalStorage } from "@reco-m/core";
import { app, loginType, socialType, otherLogin } from "@reco-m/core-ui";

import { weChatService, getQQService, getWeiBoService, loginSMSService, authService, loginService } from "@reco-m/auth-service";

import { Namespaces } from "./common";

export namespace accountBindMobileModel {
    export const namespace = Namespaces.accountBindMobile;

    export const state = freeze({ ...CoreState, social: [], phoneNumber: "", smsCode: "" }, !0);

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,

        *checkThirdAccess({ thirdcode, thirdType, message }, { call, put }) {
            const getThirdLogin =
                Number.parseInt(thirdType, 10) === loginType.wechat
                    ? weChatService.getWechatLoginPost.bind(weChatService)
                    : Number.parseInt(thirdType, 10) === loginType.qq
                    ? getQQService.getQQLoginPost.bind(getQQService)
                    : getWeiBoService.getWeiBoLoginPost.bind(getWeiBoService);

            try {
                yield put({ type: "showLoading" });
                const result = yield call(getThirdLogin, {
                    grant_type: Number.parseInt(thirdType, 10) === loginType.wechat ? "verification_code" : "token",
                    client_id: server.apiKey!.apiKey,
                    client_secret: server.apiKey!.secret,
                    redirect_uri: Number.parseInt(thirdType, 10) === loginType.weibo ? server.redirectUrl!.weiboredirect_uri : server.redirectUrl!.qqredirect_uri,
                    code: thirdcode,
                });

                if (result.uid) {
                    loginSMSService.refreshToken(result, server.auth!.autoRefreshToken);
                    yield put({ type: "hideLoading" });
                    yield put({ type: "auth/refresh" });

                    if (!getStorageObject("allscenes")) {
                        yield put({ type: `${Namespaces.login}/getAllSceneAction`, message, logintype: "sms" });
                    } else {
                        yield put(routerRedux.replace("/"));
                    }
                } else {
                    yield put({ type: "hideLoading" });
                    setLocalStorage("openId", result.open_id)
                    yield call(message!.error, "请先绑定手机号");
                }
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *accountBMsendVerifyCode({ message, delay, data }, { call }) {
            const cleardelay = delay();

            try {
                yield call(loginSMSService.getLoginCode, {
                    response_type: "mobile",
                    client_id: server.apiKey!.apiKey,
                    scope: "",
                    ...data,
                });
            } catch (e) {
                message!.error(e.errmsg || e);
                cleardelay();
            }
        },

        *smsLoginAndBindThird({ message, thirdType }, { select, put, call }) {
            const data = yield select(({ accountBindMobile }) => accountBindMobile),
                { phoneNumber, smsCode } = data || {};
            try {
                const token = yield call(loginSMSService.loginNew, {
                    username: phoneNumber,
                    code: smsCode,
                });
                loginSMSService.refreshToken(token, server.auth!.autoRefreshToken);
                yield put({ type: "auth/refresh" });
                yield put({ type: "user/getCurrentUser" });
                yield put({ type: "postThirdAccountBindAction", message, thirdType, openId: getLocalStorage("openId") });
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },

        *postThirdAccountBindAction({ message, thirdType, openId }, { call, put }) {
            const postThirdAccountBind =
                thirdType === loginType.wechat
                    ? weChatService.bindWechatAccount.bind(weChatService)
                    : thirdType === loginType.qq
                    ? getQQService.bindQQAccount.bind(getQQService)
                    : getWeiBoService.bindWeiboAccount.bind(getWeiBoService);
            try {
                const result = yield call(postThirdAccountBind, { openId });
                if (result) {
                    if (thirdType === loginType.wechat) {
                        yield put({ type: `intergral/operateMemberIntegral`, eventCode: "BindWeChat" });
                    } else if (thirdType === loginType.qq) {
                        yield put({ type: `intergral/operateMemberIntegral`, eventCode: "BindQQ" });
                    } else if (thirdType === loginType.weibo) {
                        yield put({ type: `intergral/operateMemberIntegral`, eventCode: "BindWeibo" });
                    }

                    yield call(message!.success, "绑定成功");
                    if (!getStorageObject("allscenes")) {
                        yield put({ type: `${Namespaces.login}/getAllSceneAction`, message, logintype: "sms" });
                    } else {
                        yield put(routerRedux.replace("/"));
                    }
                } else {
                    yield call(message!.error, "绑定失败");
                    yield call(authService.logout);
                }
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },

        *accountAccess({ message }, { call, put }) {
            try {
                const result = yield call(loginService.account_access);
                yield put({ type: "input", data: { social: result } });
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },

        *accountUnBindAction({ data, callsuccess, message }, { call, put }) {
            const postThirdAccountunBind =
                data.code === socialType.WeChat
                    ? weChatService.unbindWechatAccount.bind(weChatService)
                    : data.code === socialType.QQ
                    ? getQQService.unbindQQAccount.bind(getQQService)
                    : getWeiBoService.unbindWeiboAccount.bind(getWeiBoService);
            try {
                const result = yield call(postThirdAccountunBind, { openId: data.openId });
                if (result) {
                    if (data.code === loginType.wechat) {
                        yield put({ type: `intergral/refundMemberIntegral`, eventCode: "BindWeChat" });
                    } else if (data.code === loginType.qq) {
                        yield put({ type: `intergral/refundMemberIntegral`, eventCode: "BindQQ" });
                    } else if (data.code === loginType.weibo) {
                        yield put({ type: `intergral/refundMemberIntegral`, eventCode: "BindWeibo" });
                    }
                    yield call(callsuccess, "解除绑定成功");
                    yield put({ type: "accountAccess" });
                }
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },

        *socialThirdLogin({ loginType, isLogin }, { call, put }) {
            const { isLogin: logined = isLogin, type = loginType, code = "test" } = yield call(otherLogin, loginType, { isLogin: isLogin });
            if (Number(logined) === 1 || logined === "true") {
                yield put(routerRedux.push(`/login/accountbindmobile/?type=` + type + "&thirdcode=" + code));
            } else {
                let url = window.location.href.split("#/")[1].split("/?")[0];

                yield put(routerRedux.replace(`/${url}/?type=` + type + "&thirdcode=" + code + "&random=" + Math.random()));
            }
        },

        *socialGetThirdAccountBindAction({ message, thirdType, openId }, { call, put }) {
            console.log("openId", openId);
            const getThirdLogin =
                Number.parseInt(thirdType, 10) === loginType.wechat
                    ? weChatService.getWechatLoginPost.bind(weChatService)
                    : Number.parseInt(thirdType, 10) === loginType.qq
                    ? getQQService.getQQLoginPost.bind(getQQService)
                    : getWeiBoService.getWeiBoLoginPost.bind(getWeiBoService);
            try {
                const result = yield call(getThirdLogin, {
                    grant_type: Number.parseInt(thirdType, 10) === loginType.wechat ? "verification_code" : "token",
                    client_id: server.apiKey!.apiKey,
                    client_secret: server.apiKey!.secret,
                    redirect_uri: Number.parseInt(thirdType, 10) === loginType.weibo ? server.redirectUrl!.weiboredirect_uri : server.redirectUrl!.qqredirect_uri,
                    code: openId,
                });
                if (result.open_id) {
                    yield put({ type: "socialPostThirdAccountBindAction", message, thirdType, openId: result.open_id });
                }
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },

        *socialPostThirdAccountBindAction({ message, thirdType, openId }, { call, put }) {
            const postThirdAccountBind =
                thirdType === loginType.wechat
                    ? weChatService.bindWechatAccount.bind(weChatService)
                    : thirdType === loginType.qq
                    ? getQQService.bindQQAccount.bind(getQQService)
                    : getWeiBoService.bindWeiboAccount.bind(getWeiBoService);
            try {
                const result = yield call(postThirdAccountBind, { openId });
                if (result) {
                    if (thirdType === loginType.wechat) {
                        yield put({ type: `intergral/operateMemberIntegral`, eventCode: "BindWeChat" });
                    } else if (thirdType === loginType.qq) {
                        yield put({ type: `intergral/operateMemberIntegral`, eventCode: "BindQQ" });
                    } else if (thirdType === loginType.weibo) {
                        yield put({ type: `intergral/operateMemberIntegral`, eventCode: "BindWeibo" });
                    }
                    yield put({ type: "accountAccess" });
                    yield call(message!.success, "绑定成功");
                } else {
                    yield put({ type: "accountAccess" });
                    yield call(message!.error, "绑定失败");
                }
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },
    };
}

app.model(accountBindMobileModel);
