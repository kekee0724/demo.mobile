import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { workOrderService, parkcatalogueService } from "@reco-m/workorder-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces } from "./common";

let applyListCounter = 0;

export namespace applyModel {
    export const namespace = Namespaces.apply;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            submitting: false,
            modalFlag: false,
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        applyListPage(state: any, { data, thisChangeId }) {
            if (thisChangeId < applyListCounter) return state;

            data = { ...data };

            return produce(state, (draft) => {
                Object.assign(draft, data, {
                    items: data.currentPage <= 1 ? data.items : [...draft.items, ...data.items],
                    refreshing: false,
                    hasMore: data.currentPage < data.totalPages,
                    showList: true,
                });
            });
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getOrderCatalogs`, message });
                yield put({
                    type: `getByUser`,
                    params: {
                        pageIndex: 1,
                        status: data.status,
                        topicStatus: data.topicStatus,
                        key: data.key,
                        codes: data.codes,
                        showHidCatalogs: data.showHidCatalogs,
                    },
                    message,
                });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getByUser({ params, message }, { call, select, put }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser` });

                const user = yield select((state) => state[authNamespaces.user]),
                    currentUser = user.currentUser;
                if (currentUser && currentUser.id) {
                    const thisChangeId = ++applyListCounter,
                        data = yield call(workOrderService.getByUser, {
                            ...params,
                            pageSize: 15,
                            inputerID: currentUser.id,
                            parkId: getLocalStorage("parkId"),
                            orderBy: "inputTime desc",
                        });

                    yield put({ type: "applyListPage", data, thisChangeId });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },

        *getOrderCatalogs({ message }, { call, put }) {
            try {
                let catalogs = yield call(parkcatalogueService.getList, {
                    rootCode: "WORKORDER",
                    parkIds: getLocalStorage("parkId"),
                    authorized: false,
                });

                catalogs = catalogs.filter((item) => item.layer === 1);

                yield put({ type: "input", data: { catalogs: catalogs } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(applyModel);
