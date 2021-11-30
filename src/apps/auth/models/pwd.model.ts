import * as routerRedux from "react-router-redux";
import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, customEvent, crypt, removeLocalStorage } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { authService, authAccountHttpService } from "@reco-m/auth-service";

import { Namespaces } from "./common";

export namespace pwdModel {
    export const namespace = Namespaces.pwd;

    export const state = freeze({ ...CoreState }, !0);

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put }) {
            try {
                yield put({ type: "getAccountMobile" });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getAccountMobile({ message, callback }, { select, put }) {
            try {
                yield yield put({ type: `${Namespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[Namespaces.user]);
                const currentUser = user!.currentUser;
                yield put({ type: "input", data: { phonenumber: currentUser.mobile, isPwd: true } });
                callback && callback();
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *sendResetCode({ message, delay, data }, { call }) {
            const cleardelay = delay();

            try {
                yield call(authAccountHttpService.sendGuestResetPwd, { mobile: data });
            } catch (e) {
                message!.error(e.errmsg || e);
                cleardelay();
            }
        },

        *submit({ message, callback }, { call, select }) {
            try {
                const { phonenumber: mobile, code, password: newPassword } = yield select(({ pwd }) => pwd);

                const cryptPassword = crypt(newPassword);
                yield call(authAccountHttpService.guestResetPwd, {
                    encryMode: server["rsa"]?.enable ? 1 : 0,
                    mobile: mobile,
                    code: code,
                    newPassword: cryptPassword,
                    reNewPassword: cryptPassword,
                });
                yield call(callback!);
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },

        *logout({ message }, { call, put }) {
            try {
                removeLocalStorage("allscenes");
                removeLocalStorage("allscenesIds");
                removeLocalStorage("allTakeScenesId");
                yield call(authService.logout);

                yield call(customEvent.emit, "logout");

                yield put({ type: "init" });

                yield put(routerRedux.replace("/"));
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },
    };
}

app.model(pwdModel);
