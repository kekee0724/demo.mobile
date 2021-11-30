import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze, produce } from "immer";

import { CoreEffects, CoreReducers, setStorageObject, getStorageObject, removeStorage } from "@reco-m/core";
import { orderexist, deepClone } from "@reco-m/ipark-common";
import { app } from "@reco-m/core-ui";
import { myMarketInHttpService } from "@reco-m/workorder-service";

import {} from "@reco-m/order-models";

import { Namespaces } from "./common";

export namespace marketSearchModel {
    export const namespace = Namespaces.marketSearch;

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

        marketPage(state: any, { marketList, thisChangeId }) {
            if (thisChangeId < changeCounter) return state;

            return produce(state, (draft) => {
                Object.assign(draft, marketList, {
                    items: marketList.currentPage <= 1 ? marketList.items : [...draft.items, ...marketList.items],
                    refreshing: false,
                    hasMore: marketList.currentPage < marketList.totalPages,
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
        *getInstitutionList({ message, data }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const thisChangeId = ++changeCounter,
                    marketList = yield call(myMarketInHttpService.getPaged, data);

                yield put({ type: "marketPage", marketList, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *addSearchHistory({ message, key }, { put }) {
            try {
                if (getStorageObject("MarketHistory")) {
                    let data = getStorageObject("MarketHistory");
                    let history = deepClone(data);
                    if (!orderexist(key, history)) {
                        history.push({ key: key });
                        setStorageObject("MarketHistory", history);
                    }
                    yield put({ type: "input", data: { searchHistory: [...history] } });
                } else {
                    setStorageObject("MarketHistory", [{ key: key }]);
                    yield put({ type: "input", data: [{ key: key }] });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getSearchHistory({ message }, { put }) {
            try {
                if (getStorageObject("MarketHistory")) {
                    yield put({ type: "input", data: { searchHistory: getStorageObject("MarketHistory") } });
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
                setStorageObject("MarketHistory", filter);
                yield put({ type: "input", data: { searchHistory: filter } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *removeAll({ message }, { put }) {
            try {
                removeStorage("MarketHistory");
                yield put({ type: "input", data: { searchHistory: [] } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(marketSearchModel);
