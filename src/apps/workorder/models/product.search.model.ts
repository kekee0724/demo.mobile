import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze, produce } from "immer";

import { CoreEffects, CoreReducers, getStorageObject, setStorageObject, removeStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { serviceProductService } from "@reco-m/workorder-service";
import { orderexist, deepClone } from "@reco-m/ipark-common";

import { Namespaces } from "./common";

export namespace productSearchModel {
    export const namespace = Namespaces.productSearch;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            show: false,
            type: 1,
            csfwId: "",
            key: "",
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        productPage(state: any, { productList, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, productList, {
                    items: productList.currentPage <= 1 ? productList.items : [...draft.items, ...productList.items],
                    refreshing: false,
                    hasMore: productList.currentPage < productList.totalPages,
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
        *getProductList({ message, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const thisChangeId = ++changeCounter,
                    productList = yield call(serviceProductService.getPaged, data);

                yield put({ type: "productPage", productList, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *addSearchHistory({ message, key }, { put }) {
            try {
                if (getStorageObject("productHistory")) {
                    let data = getStorageObject("productHistory");
                    let history = deepClone(data);
                    if (!orderexist(key, history)) {
                        history.push({ key: key });
                        setStorageObject("productHistory", history);
                    }
                    yield put({ type: "input", data: { searchHistory: [...history] } });
                } else {
                    setStorageObject("productHistory", [{ key: key }]);
                    yield put({ type: "input", data: [{ key: key }] });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getSearchHistory({ message }, { put }) {
            try {
                if (getStorageObject("productHistory")) {
                    yield put({ type: "input", data: { searchHistory: getStorageObject("productHistory") } });
                } else {
                    yield put({ type: "input", data: { searchHistory: [] } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *removeSearchHistory({ message, item, searchHistory }, { put }) {
            try {
                let filter = searchHistory.filter((history) => history.key !== item.key);
                setStorageObject("productHistory", filter);
                yield put({ type: "input", data: { searchHistory: filter } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *removeAll({ message }, { put }) {
            try {
                removeStorage("productHistory");
                yield put({ type: "input", data: { searchHistory: [] } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(productSearchModel);
