import * as routerRedux from "react-router-redux";
import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, PASSWORD_REGEXP, crypt, getStorageObject, getLocalStorage } from "@reco-m/core";
import { app, otherLogin } from "@reco-m/core-ui";

import { loginSMSService, loginService } from "@reco-m/auth-service";

import { LoginTypeEnum, Namespaces } from "./common";

export namespace loginModel {
    export const namespace = Namespaces.login;

    export const state = freeze(
        {
            ...CoreState,
            loginType: LoginTypeEnum.sms,
            checked: true,
        },
        !0
    );

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        swap(state: any) {
            return produce(state, (draft) => {
                draft.loginType = state.loginType === LoginTypeEnum.sms ? LoginTypeEnum.pwd : LoginTypeEnum.sms;
                draft.password = null;
                draft.loginName = state.loginType === LoginTypeEnum.sms ? state.loginName : "";
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *sendVerifyCode({ message, delay, data }, { call }) {
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
        *submit({ callback, message }, { select, put }) {
            const data = yield select(({ login }) => login),
                { loginName, loginType: type, password } = data;

            yield put({ type: "showLoading" });

            yield put({ type: `${type === LoginTypeEnum.sms ? "smsLogin" : "pwdLogin"}`, data: { loginName, password }, message, callback });
        },
        *thirdLogin({ loginType, isLogin }, { call, put }) {
            const data = yield call(otherLogin, loginType, { isLogin: isLogin });
            if (Number(data.isLogin) === 1 || data.isLogin === "true") {
                let url = window.location.href.split("#/")[1];
                yield put(routerRedux.push(`/${url}/accountbindmobile/?type=` + data.type + "&thirdcode=" + data.code));
            } else {
                let url = window.location.href.split("#/")[1].split("/?")[0];

                yield put(routerRedux.replace(`/${url}/?type=` + data.type + "&thirdcode=" + data.code));
            }
        },

        *smsLogin({ data, message }, { call, put }) {
            try {
                const token = yield call(loginSMSService.loginNew, { username: data.loginName, code: data.password });

                loginSMSService.refreshToken(token, server.auth!.autoRefreshToken);

                yield put({ type: "auth/refresh" });

                yield put({ type: "input", data: { loading: false } });
                yield put({ type: "hideLoading" });

                if (!getStorageObject("allscenes")) {
                    yield put({ type: "getAllSceneAction" });
                } else yield put(routerRedux.replace("/"));
            } catch (e) {
                yield put({ type: "input", data: { loading: false } });
                yield put({ type: "hideLoading" });
                message!.error(e.errmsg || e);
            }
        },

        *pwdLogin({ data, message, callback }, { call, put }) {
            try {
                const cryptPassword = crypt(data.password);
                const login = {
                        encryMode: server["rsa"]?.enable ? 1 : 0,
                        username: data.loginName,
                        password: cryptPassword
                    },
                    token = yield call(loginService.login, login);

                loginService.refreshToken(token, server.auth!.autoRefreshToken);

                server.auth!.autoLogin && loginService.refreshUID(login);

                // 如果不符合(密码长度8-32位,必须包含数字、字母或符号)规则则需要修改密码
                if (!PASSWORD_REGEXP.test(data.password) && !getLocalStorage("noCheckPassword")) {
                    callback && (yield call(callback, data));
                }

                yield put({ type: "auth/refresh" });
                yield put({ type: "input", data: { loading: false } });
                yield put({ type: "hideLoading" });
            } catch (e) {
                yield put({ type: "input", data: { loading: false } });
                yield put({ type: "hideLoading" });
                message!.error(e.errmsg || e);
            }
        },
        *getAllSceneAction({ message, logintype }, { put }) {
            try {
                yield put({ type: "getTakeScence", message, logintype });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getTakeScence({ message }, { put }) {
            try {
                yield put(routerRedux.replace("/"));
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },
    };
}

app.model(loginModel);
