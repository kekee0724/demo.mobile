import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState } from "@reco-m/core";
import { app } from "@reco-m/core-ui";

import { Namespaces } from "./common";

export namespace gesturesModel {
    export const namespace = Namespaces.gestures;

    export const state = freeze({ ...CoreState }, !0);

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        init() {
            return state;
        },
    };
}

app.model(gesturesModel);
