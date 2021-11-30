import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { circleService } from "@reco-m/ipark-white-circle-service";

import { Namespaces } from "./common";

export namespace circleModel {
    export const namespace = Namespaces.circle;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ message, data }, { put }) {
            try {
                yield put({ type: "init" });
                yield put({ type: "input", data: { selectTag: data.selectTag } });
                yield put({ type: "getHostCircle", message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getHostCircle({ message }, { call, put }) {
            try {
                put({ type: "showLoading" });
                const parm = {
                    parkId: getLocalStorage("parkId"),
                    categoryValue: getLocalStorage("categoryValue"),
                    isValid: true,
                    orderBy: "isTop desc,postCount desc,memberCount desc",
                    pageSize: 3,
                    postIsPublic: true,
                    publishStatus: 1,
                };
                const hostCircle = yield call(circleService.getPaged, parm);
                yield put({ type: "input", data: { hostCircle: hostCircle && hostCircle.items } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *outCircle({ message, id, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const result = yield call(circleService.out, { id: id, parkId: getLocalStorage("parkId") });
                yield put({ type: "input", data: { result: result } });
                yield call(callback!);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *joinCircle({ message, id, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const result = yield call(circleService.Join, { id: id, parkId: getLocalStorage("parkId") });
                yield put({ type: "input", data: { result: result } });
                yield call(callback!);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(circleModel);
