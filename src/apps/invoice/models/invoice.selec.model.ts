import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import produce, { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";
import { IParkBindTableNameEnum } from "@reco-m/ipark-common";

import { cashInvoiceService } from "@reco-m/invoice-service";

import { Namespaces } from "./common";

let changeCounter = 0;

export namespace invoiceSelectModel {
    export const namespace = Namespaces.invoiceSelect;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            items: [],
            pageSize: 15,
            key: "",
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
        *invoiceTitleGetPaged({ message, index, key, invoiceType }, { put, select, call }) {
            try {
                yield put({ type: "showLoading" });
                const dataparam = {
                    pageIndex: index,
                    key: key,
                    invoiceType: invoiceType,
                    pageSize: 15,
                    bindTableName: IParkBindTableNameEnum.sysaccount,
                    parkId: getLocalStorage("parkId"),
                };
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });

                const user = yield select((state) => state[authNamespaces.user]),
                    currentUser = user && user.currentUser;
                const thisChangeId = ++changeCounter,
                    data = yield call(cashInvoiceService.getPaged, { bindTableId: currentUser.id, ...dataparam });

                yield put({ type: "invoicePage", data, thisChangeId });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *setInitData({ message }, { put }) {
            try {
                yield put({ type: "input", item: null, pageIndex: 0 });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(invoiceSelectModel);
