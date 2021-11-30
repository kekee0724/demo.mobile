import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze, produce } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { myMarketInHttpService } from "@reco-m/workorder-service";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces } from "./common";

export namespace marketApplyModel {
    export const namespace = Namespaces.marketApply;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            items: [],
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        getMarketApplyListPage(state: any, { data, thisChangeId }) {
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

        *getMarketApplyList({ fail, params, status, topicStatus }, { call, put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser` });

                const user = yield select((state) => state[authNamespaces.user]),
                    currentUser = user.currentUser;
                const visitorData = {
                        pageIndex: 1,
                        pageSize: 15,
                        codes: "fuwsl,fuwcp",
                        status: status,
                        topicStatus,
                        parkId: getLocalStorage("parkId"),
                        principalUserId: currentUser.id,
                        ...params,
                    },
                    thisChangeId = ++changeCounter,
                    data = yield call(myMarketInHttpService.getWorkOrder, visitorData);
                yield put({ type: "getMarketApplyListPage", data, thisChangeId });
                yield put({ type: "input", data: { showList: true } });
            } catch (error) {
                fail!(error.errmsg);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(marketApplyModel);
