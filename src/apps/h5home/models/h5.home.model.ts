/* eslint-disable max-nested-callbacks */
import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, CoreState } from "@reco-m/core";
import { loginService } from "@reco-m/auth-service";

import { app } from "@reco-m/core-ui";

import { Namespaces } from "./common";

export namespace h5HomeModel {
    export const namespace = Namespaces.h5Home;
    export const state: any = freeze(
        {
            ...CoreState,
            showloading: true,
        },
        !0
    );

    export type StateType = typeof state;

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, callback, data }, { put }) {
            try {
                yield put({ type: `initParams`, data, callback, message });
                
            } catch (e) {
                message!.error(`${e?.errmsg || e}`);
            }
        },
        /**
         * 处理传入的参数
         */
        *initParams({ message, data, callback }, { call }) {
            try {
                // if (data?.unitId) {
                //     setLocalStorage("unitId", data?.unitId);
                // }
                // if (data?.parkId) {
                //     setLocalStorage("unitId", data?.parkId);
                // }
                // if (data?.parkName) {
                //     setLocalStorage("unitId", data?.parkName);
                // }
                
                const token = {
                    token_str: data.tokenStr,
                    refresh_token: data.refreshToken,
                };
                loginService.refreshToken(token, server.auth!.autoRefreshToken);
                yield call(callback);
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}
app.model(h5HomeModel);
