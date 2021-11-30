import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";

import { customerService } from "@reco-m/ipark-customer-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";
import { Namespaces } from "./common";

export namespace selectCompanyModel {
    export const namespace = Namespaces.selectCompany;

    export type StateType = typeof state;

    let changeCounter = 0;

    export const state: any = freeze(
        {
            pageSize: 20,
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,

        init() {
            return state;
        },

        getCustomerPage(state: any, { data, thisChangeId }) {
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
        *initPage({ filterMyConpany, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getCustomer`, filterMyConpany, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getCustomer({ index, key, message }, { call, put }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                let params = {
                    pageIndex: index,
                    pageSize: 20,
                    key: key,
                    parkId: getLocalStorage("parkId"),
                    status: 1,
                    customerType: 1,
                    skipAuditPark: true
                };
                const thisChangeId = ++changeCounter;
                let data = yield call(customerService.getPaged, params);

                yield put({ type: "getCustomerPage", data, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(selectCompanyModel);
