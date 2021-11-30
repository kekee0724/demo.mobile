import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces } from "./common";

export namespace myCompanyModel {
    export const namespace = Namespaces.mycompany;

    export const state = freeze({ ...CoreState }, !0);

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message }, { put }) {
            try {
                yield put({ type: "getUserUnits" });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getUserUnits({ message }, { put, select }) {
            try {
                yield put({ type: "getAllSceneAction" });
                yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const units = user!.units;
                yield put({ type: "input", data: { units: units } });
            } catch (e) {
                message!.error(e.errmsg || e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(myCompanyModel);
