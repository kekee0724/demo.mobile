import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState, customEvent } from "@reco-m/core";

import { app, clearCache } from "@reco-m/core-ui";

import { userProfileService } from "@reco-m/auth-service";

import { Namespaces } from "./common";

export namespace myModel {
    export const namespace = Namespaces.my;
    export const state: any = freeze({ ...CoreState }, !0);

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *getHeadImageAction({ message }, { call, put }) {
            try {
                const headImage = yield call(userProfileService.getHeadImage);
                yield put({
                    type: "input",
                    data: { headImage: headImage },
                });
            } catch (error) {
                message!.error!(error.errmsg);
            }
        },
        *clearCache({}, { call }) {
            yield call(clearCache);

            yield call(customEvent.emit, "clearCache");
        },
    };
}

app.model(myModel);
