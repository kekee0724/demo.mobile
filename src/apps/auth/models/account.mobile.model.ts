import * as routerRedux from "react-router-redux";
import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, crypt, removeLocalStorage } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { authService, authAccountHttpService } from "@reco-m/auth-service";

import { Namespaces } from "./common";

export namespace accountMobileModel {
    export const namespace = Namespaces.accountMobile;

    export const state = freeze({ ...CoreState, showloading: !0 }, !0);

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,

        *getAccountMobile({ message }, { select, put }) {
            try {
                yield yield put({ type: `${Namespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[Namespaces.user]);
                const currentUser = user!.currentUser;
                yield put({ type: "input", data: { mobile: currentUser.mobile } });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *sendBindCode({ delay, param, message }, { call }) {
            const cleardelay = delay();
            try {
                if (param.password) {
                    (param.encryMode = server["rsa"]?.enable ? 1 : 0), (param.password = crypt(param.password));
                }
                yield call(authAccountHttpService.sendEditMobileCode, param);
            } catch (e) {
                message!.error(e.errmsg || e);
                cleardelay();
            }
        },

        *bindMobile({ param, message, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                yield call(authAccountHttpService.editMobile, param);
                callback && callback!();
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *logout({ message }, { call, put }) {
            try {
                removeLocalStorage("allscenes");
                removeLocalStorage("allscenesIds");
                removeLocalStorage("allTakeScenesId");
                yield call(authService.logout);

                yield put({ type: "init" });

                yield put(routerRedux.replace("/my/login"));
            } catch (e) {
                message!.error(e.errmsg || e);
            }
        },
    };
}

app.model(accountMobileModel);
