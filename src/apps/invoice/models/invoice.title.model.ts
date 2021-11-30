import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { cashInvoiceService } from "@reco-m/invoice-service";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces } from "./common";

let changeCounter = 0;

export namespace invoiceTitleModel {
    export const namespace = Namespaces.invoiceTitle;

    export type StateType = typeof state;

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
        invoiceTitlePage(state: any, { data, thisChangeId }) {
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
        *getInvoiceTitleList({ message, invoice }, { select, call, put }) {
            try {
                const params = {
                    pageIndex: invoice.pageIndex,
                    pageSize: 15,
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    ...invoice,
                    parkId: getLocalStorage("parkId"),
                };
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;
                const thisChangeId = ++changeCounter,
                    data = yield call(cashInvoiceService.getPaged, { ...params, bindTableId: currentUser.id });

                yield put({ type: "invoiceTitlePage", data, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *invoiceTitleDelete({ message, callback, params }, { call, put }) {
            try {
                yield put({ type: "showLoading" });

                const invoiceTitleDelete = yield call(cashInvoiceService.deleteInvoice, params);

                yield call(callback!, invoiceTitleDelete);
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(invoiceTitleModel);
