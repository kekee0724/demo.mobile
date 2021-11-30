import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { myOrderService } from "@reco-m/order-service";

import { Namespaces } from "./common";
export namespace myorderrefundorderModel {
    export const namespace = Namespaces.myorderrefundorder;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
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
                yield put({ type: `input`, data: { isAfterSale: data.isAfterSale } });
                yield put({
                    type: `getOrdersAction`,
                    index: 1,
                    isAfterSale: data.isAfterSale,
                    message,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getOrdersAction({ message, index, isAfterSale }, { call, put, select }) {
            try {
                yield put({ type: "showLoading" });
                let order = {
                    pageIndex: index,
                    isAfterSale: isAfterSale,
                    orderBy: "inputTime desc",
                    parkId: getLocalStorage("parkId"),
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
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *cancelRefundOrder({ message, cancelrefund }, { call, put }) {
            try {
                const result = yield call(myOrderService.cancelRefundOrder, cancelrefund.id);
                yield put({ type: "input", data: { cancelRefund: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *reRefundOrder({ message, rerefund }, { call, put }) {
            try {
                const result = yield call(myOrderService.reRefundOrder, rerefund.id);
                yield put({ type: "input", data: { reRefund: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *cancelOrder({ message, cancel }, { call, put }) {
            try {
                const result = yield call(myOrderService.cancelOrder, cancel.id);
                yield put({ type: "input", data: { orderOperate: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(myorderrefundorderModel);
