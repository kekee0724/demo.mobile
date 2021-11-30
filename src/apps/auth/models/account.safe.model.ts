import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { authService } from "@reco-m/auth-service";
import { Namespaces } from "./common";

export namespace accountSafeModel {
    export const namespace = Namespaces.accountsafe;

    export const state = freeze({ ...CoreState }, !0);

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put }) {
            try {
                yield put({ type: "getCurrentUser", message });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCurrentUser({ message, callback }, { call, put }) {
            try {
                const user = yield call(authService.refreshCurrentUser);

                yield put({ type: "input", data: user });

                if (callback) yield call(callback, user);
            } catch (e) {
                message!.error(e.errmsg||e);
            }
        },
    };
}

app.model(accountSafeModel);
