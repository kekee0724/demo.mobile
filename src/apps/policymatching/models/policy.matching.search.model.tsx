import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage, removeLocalStorage, getStorageObject, setStorageObject } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { policyService } from "@reco-m/policymatching-service";

import { orderexist, deepClone } from "@reco-m/ipark-common";

import { Namespaces } from "./common";

export namespace policymatchingsearchModel {
    export const namespace = Namespaces.policymatchingsearch;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
        policyPage(state: any, { data, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;
            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
                    refreshing: false,
                    hasMore: data.currentPage < data.totalPages,
                });
            });
        },
        policyMatchingPage(state: any, { data, thisChangeId }) {
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
                yield put({ type: `getSearchHistory` });
                yield put({
                    type: `getPolicy`,
                    pageIndex: 1,
                    callback: () => {},
                });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getSearchHistory({ message }, { put }) {
            try {
                if (getStorageObject("PolicyMatchSearch")) {
                    yield put({ type: "input", data: { searchHistory: getStorageObject("PolicyMatchSearch")! } });
                } else {
                    yield put({ type: "input", data: { searchHistory: [] } });
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },

        *addSearchHistory({ message, key }, { put }) {
            try {
                if (getStorageObject("PolicyMatchSearch")) {
                    let data = getStorageObject("PolicyMatchSearch");
                    let history = deepClone(data);
                    if (!orderexist(key, history) && (key as any).trim().length !== 0) {
                        if (history.length > 8) {
                            history.splice(0, 1);
                        }
                        history.push({ key: key });
                        setStorageObject("PolicyMatchSearch", history);
                    }
                    yield put({ type: "input", data: { searchHistory: [...history] } });
                } else {
                    if ((key as any).trim().length !== 0) {
                        setStorageObject("PolicyMatchSearch", [{ key: key }]);
                        yield put({ type: "input", data: { searchHistory: [{ key: key }] } });
                    }
                }
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *removeAll({ message }, { put }) {
            try {
                removeLocalStorage("PolicyMatchSearch");
                yield put({ type: "input", data: { searchHistory: [] } });
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        // *GetRecommandPolicyPaged({ message, data }, { call, put }) {
        //   try {
        //     const thisChangeId = ++changeCounter,
        //       parm = yield call(policyService.GetRecommandPolicyPaged, data);
        //     yield put({ type: "policyMatchingPage", data: parm, thisChangeId });
        //   } catch (e) {
        //      console.log('catcherror', e?.errmsg||e);
        //      message!.error(`${e?.errmsg || e}`)
        //   }
        // },
        *getPolicy({ message, pageIndex, searchParamkey, callback }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const params = {
                    pageIndex: pageIndex,
                    pageSize: 15,
                    // /  ApplyTagIDs: key && [key.id],
                    parkId: getLocalStorage("parkId"),
                    key: searchParamkey,
                };

                const thisChangeId = ++changeCounter,
                    data = yield call(policyService.getPaged, Object.assign({ pageSize: 10, IsValid: true }, params));
                // yield put({ type: "input", data, thisChangeId });
                yield put({ type: "policyPage", data, thisChangeId });
                callback();
            } catch (e) {
                console.log("catcherror", e?.errmsg || e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(policymatchingsearchModel);
