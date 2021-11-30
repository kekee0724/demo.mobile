import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { cashInvoiceService } from "@reco-m/invoice-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { Namespaces } from "./common";

let changeCounter = 0;

export namespace invoiceModel {
    export const namespace = Namespaces.invoice;

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
        invoicePage(state: any, { data, thisChangeId }) {
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
        *initPage({ params, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getInvoiceList`, message, params });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getInvoiceList({ message, params }, { select, call, put }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;
                const thisChangeId = ++changeCounter,
                    data = yield call(cashInvoiceService.getPaged, { ...params, inputerId: currentUser.id });
                yield put({ type: "invoicePage", data, thisChangeId });
                yield put({ type: "input", data: { showList: true } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(invoiceModel);
