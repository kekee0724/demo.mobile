import { EffectsMapObject } from "dva";

import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { policyService } from "@reco-m/policymatching-service";

import { Namespaces } from "./common";

export namespace policyserviceOriginalDetailModel {

    export const namespace = Namespaces.policyserviceoriginaldetail;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ id, message }, { put, call }) {
            put({ type: "showLoading" });
            try {
                const policyDetail = yield call(policyService.get, id);

                yield put({ type: "update", data: { policyDetail }});
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        }
    };
}

app.model(policyserviceOriginalDetailModel);