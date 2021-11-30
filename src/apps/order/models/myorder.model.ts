import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { myOrderService } from "@reco-m/order-service";

import { Namespaces } from "./common";
export namespace myorderModel {
    export const namespace = Namespaces.myorder;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        resourcePaged(state: any, { data, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
                    refreshing: false,
                    hasMore: data.currentPage < data.totalPages,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: "input", data: { status: data.status, commentStatus: data.commentStatus } });
                yield put({ type: "getOrdersAction", index: 1, status: data.status, commentStatus: data.commentStatus, key: data.key, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getOrdersAction({ message, index, status, commentStatus, key }, { call, put, select }) {
            try {
                let order = {
                    pageIndex: index,
                    parkId: getLocalStorage("parkId"),
                    orderStatus: status ? status : null,
                    commentStatus: commentStatus ? commentStatus : "",
                    orderBy: "inputTime desc",
                    key: key,
                };

                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);

                const currentUser = user!.currentUser;
                if (currentUser.id) {
                    const result = yield call(myOrderService.getPaged, {
                        inputerId: currentUser.id || 0,
                        ...order,
                    });

                    let thisChangeId = ++changeCounter;

                    yield put({ type: "resourcePaged", data: result, thisChangeId: thisChangeId });

                    yield put({ type: "input", data: { showloading: false, showList: true } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *cancelOrder({ message, params, callBack }, { call }) {
            try {
                const result = yield call(myOrderService.cancelOrder, params.id);
                if (result) {
                    callBack();
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(myorderModel);
