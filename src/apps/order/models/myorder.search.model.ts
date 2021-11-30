import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage, setStorageObject, getStorageObject, removeStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { orderexist, deepClone } from "@reco-m/ipark-common";

import { myOrderService } from "@reco-m/order-service";

import { Namespaces } from "./common";
export namespace myordersearchModel {
    export const namespace = Namespaces.myordersearch;

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
        *initPage({ message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getSearchHistory`, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getSearchHistory({ message }, { put }) {
            try {
                if (getStorageObject("MyOrderHistory")) {
                    yield put({ type: "input", data: { searchHistory: getStorageObject("MyOrderHistory") } });
                } else {
                    yield put({ type: "input", data: { searchHistory: [] } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *addSearchHistory({ message, key }, { put }) {
            try {
                if (getStorageObject("MyOrderHistory")) {
                    let data = getStorageObject("MyOrderHistory");
                    let history = deepClone(data);
                    if (!orderexist(key, history)) {
                        history.push({ key: key });
                        setStorageObject("MyOrderHistory", history);
                    }
                    yield put({ type: "input", data: { searchHistory: [...history] } });
                } else {
                    setStorageObject("MyOrderHistory", [{ key: key }]);
                    yield put({ type: "input", data: [{ key: key }] });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getOrdersAction({ message, index, key }, { call, put, select }) {
            try {
                let order = {
                    pageIndex: index,
                    parkId: getLocalStorage("parkId"),
                    key: key,
                };
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;
                if (currentUser.id) {
                    const parms = yield call(myOrderService.getPaged, {
                        inputerId: currentUser.id || 0,
                        ...order,
                    });
                    let thisChangeId = ++changeCounter;

                    yield put({ type: "resourcePaged", data: parms, thisChangeId: thisChangeId });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *removeSearchHistory({ message, item, searchHistory }, { put }) {
            try {
                let filter = searchHistory.filter((history) => history.key !== item.key);
                setStorageObject("MyOrderHistory", filter);
                yield put({ type: "input", data: { searchHistory: filter } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *removeAll({ message }, { put }) {
            try {
                removeStorage("MyOrderHistory");
                yield put({ type: "input", data: { searchHistory: [] } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(myordersearchModel);
