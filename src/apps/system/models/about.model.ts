import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { appVersionService } from "@reco-m/system-service";

import { Namespaces } from "./common";

export namespace aboutModel {
    export const namespace = Namespaces.about;

    export const state = freeze(
        {
            ...CoreState,
            version: "0.0.0.0",
        },
        !0
    );

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,

        *getNewAppVersion({ message, data }, { call, put }) {
            try {
                const version = yield call(appVersionService.getAppVersion, data);
                yield put({ type: "input", data: { version: version } });
            } catch (e) {
                message!.error(e.errmsg||e);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(aboutModel);
