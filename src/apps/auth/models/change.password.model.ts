import * as routerRedux from "react-router-redux";
import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, customEvent, removeLocalStorage } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { authService, authAccountHttpService } from "@reco-m/auth-service";

import { Namespaces } from "./common";

export namespace changePasswordModel {
    export const namespace = Namespaces.changepassword;

    export const state: any = freeze({ ...CoreState }, !0);

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *resetPasswordAction({ message, data, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const resetPassword = yield call(authAccountHttpService.resetPwd, data);
                callback(resetPassword);
            } catch (e) {
                message!.error(e.errmsg||e);
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

                yield call(customEvent.emit, "logout");

                yield put({ type: "init" });

                yield put(routerRedux.goBack());
            } catch (e) {
                message!.error(e.errmsg||e);
            }
        },
    };
}

app.model(changePasswordModel);
