import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { routerRedux } from "dva";
import { crypt, PASSWORD_REGEXP, getLocalStorage, setLocalStorage, setStorageObject, getStorageObject } from "@reco-m/core";
import { app, jpushRegisterTag } from "@reco-m/core-ui";
import { loginService } from "@reco-m/auth-service";

import { notificationSceneService } from "@reco-m/notice-service";


import { Namespaces, LoginTypeEnum as LoginTypeEnumCore, loginModel } from "@reco-m/auth-models";
import { addMemberService } from "@reco-m/member-service";
import { loginSMSService } from "@reco-m/auth-service";

import { SceneCodes } from "./common";

export namespace iparkloginModel {
    export const namespace = Namespaces.login;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...loginModel.reducers,
    };

    export const effects: EffectsMapObject = {
        ...loginModel.effects,
        *initPage({ message }, { call, put }) {
            try {
                yield put({ type: "input", data: { areacode: "+86", tab: 1, codearr: [], loginName: null, password: null } });
            } catch (e) {
                yield call(message!.error, e.errmsg);
            }
        },
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
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
                cleardelay();
            }
        },
        *submit({ callback, message, errCallBack }, { select, put }) {
            yield put({ type: "showLoading" });
            yield put({ type: "input", data: { loading: true } });
            const data = yield select(({ login }) => login),
                { loginName, loginType: type, password } = data;

            yield put({ type: `${type === LoginTypeEnumCore.sms ? "smsLogin" : "pwdLogin"}`, data: { loginName, password }, message, callback, errCallBack });
        },
        *smsLogin({ data, message, errCallBack, callback }, { call, put, select }) {
            try {
                yield put({ type: "showLoading" });
                const token = yield call(loginSMSService.loginNew, { username: data.loginName, code: data.password });

                loginSMSService.refreshToken(token, server.auth!.autoRefreshToken);

                callback && callback();

                yield put({ type: "auth/refresh" });

                yield put({ type: "input", data: { loading: false } });
                yield yield put({ type: `${Namespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[Namespaces.user]),
                    units = user!.units;
                if (units && units.length > 0) {
                    // 存平台id
                    setLocalStorage("unitId", units[0].id);
                }
                const currentUser = user!.currentUser;
                if (currentUser && currentUser.id) {
                    // 登录添加会员
                    yield call(addMemberService.addMember, currentUser.id);
                }
                if (!getStorageObject("allscenes")) {
                    yield put({ type: "getAllSceneAction", logintype: "sms" });
                } else {
                    // yield put(routerRedux.replace("/"));
                    yield put(routerRedux.go(-2));
                }
                yield put({ type: "hideLoading" });
            } catch (e) {
                errCallBack && errCallBack();
                yield put({ type: "input", data: { loading: false } });
                yield put({ type: "hideLoading" });
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *pwdLogin({ data, message, callback }, { call, put, select }) {
            try {
                const cryptPassword = crypt(data.password);
                const login = {
                        encryMode: server["rsa"]?.enable ? 1 : 0,
                        username: data.loginName,
                        password: cryptPassword,
                    },
                    token = yield call(loginService.login, login);

                loginService.refreshToken(token, server.auth!.autoRefreshToken);
                server.auth!.autoLogin && loginService.refreshUID(login);

                yield put({ type: "auth/refresh" });
                yield put({ type: "input", data: { loading: false } });
                yield yield put({ type: `${Namespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[Namespaces.user]),
                    units = user!.units;
                if (units && units.length > 0) {
                    // 存平台id
                    setLocalStorage("unitId", units[0].id);
                }
                const currentUser = user!.currentUser;
                if (currentUser.id) {
                    // 登录添加会员
                    yield call(addMemberService.addMember, currentUser.id);
                }
                yield put({ type: "config", params: { parkName: getLocalStorage("parkName"), parkId: getLocalStorage("parkId"), accountId: token.uid } });
                // 如果不符合(密码长度8-32位,必须包含数字、字母及符号)规则则需要修改密码
                if (!PASSWORD_REGEXP.test(data.password) && !getLocalStorage("noCheckPassword")) {
                    if (!getStorageObject("allscenes")) {
                        yield put({ type: "getAllSceneAction", message, changePasword: true });
                    }
                    callback && (yield call(callback, data));
                } else {
                    if (!getStorageObject("allscenes")) {
                        yield put({ type: "getAllSceneAction", message });
                    } else yield put(routerRedux.goBack());
                }
                yield put({ type: "hideLoading" });
            } catch (e) {
                yield put({ type: "input", data: { loading: false } });
                yield put({ type: "hideLoading" });
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getAllSceneAction({ message, logintype, changePasword }, { call, put }) {
            try {
                const result = yield call(notificationSceneService.getAllScene, { productCode: "SOC" });
                let scenes = result || [];
                let ss: any = [];
                let ids: any = [];
                scenes.forEach((s) => {
                    if (SceneCodes.find((f) => f === s.sceneCode)) {
                        ss.push(s);
                        ids.push(s.id);
                    }
                });

                setStorageObject("allscenes", ss);
                setStorageObject("allscenesIDS", ids);
                yield put({ type: "getTakeScence", message, logintype, changePasword });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *getTakeScence({ message, logintype, changePasword }, { call, put }) {
            try {
                const result = yield call(notificationSceneService.getTakeScene, "SOC");
                let arr = result ? result : [];

                let tags: any = [];
                let ids: any = [];

                arr.forEach((s) => {
                    tags.push("Scene_" + s.id);
                    ids.push(s.id);
                });
                /**
                 * 原生极光设置标签场景
                 */
                jpushRegisterTag(tags.join(","));
                setStorageObject("allTakeScenesID", ids);
                if ( !changePasword ) {
                    if (logintype) {
                        yield put(routerRedux.go(-2));
                    } else {
                        yield put(routerRedux.goBack());
                    }
                }
                
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.replaceModel(iparkloginModel);
