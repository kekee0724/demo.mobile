import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";
import { freeze } from "immer";

import { CoreEffects, CoreReducers, getLocalStorage } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { cashInvoiceService } from "@reco-m/invoice-service";

import { Namespaces as authNamespaces } from "@reco-m/auth-models";
import {IParkBindTableNameEnum} from "@reco-m/ipark-common"
import { InvoiceTitleTypeEnum } from "@reco-m/ipark-common";
import { Namespaces, InvoiceEnum} from "./common";

export namespace invoiceTitleEditModel {
    export const namespace = Namespaces.invoiceTitleEdit;

    export type StateType = typeof state;

    export const state: any = freeze(
        {
            mobile: "",
            bank: "",
            bankCode: "",
            title: "",
        },
        !0
    );

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
        init() {
            return state;
        },
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *getInvoiceTitleEdit({ message, data }, { call, put }) {
            try {
                const invoiceTitleEdit = yield call(cashInvoiceService.getInvoiceDetail, data);
                yield put({ type: "input", data: { ...invoiceTitleEdit, type: invoiceTitleEdit.invoiceType, comOrPerType: invoiceTitleEdit.invoiceType === InvoiceEnum.personalInvoice ? 2 : 1 } });
            } catch (e) {
                 console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
            }
        },
        *submitInvoiceTitle({ message, callback }, { select, call, put }) {
            try {
                yield put({ type: "showLoading" });
                const state = yield select((state) => state[Namespaces.invoiceTitleEdit]);
                let params;
                if (+state!.type === InvoiceTitleTypeEnum.speciallyInvoice) {
                    params = {
                        bindTableName: IParkBindTableNameEnum.sysaccount,
                        title: state!.title,
                        taxId: state!.taxId,
                        registerAddress: state!.registerAddress,
                        registerTel: state!.registerTel,
                        bankName: state!.bankName,
                        bankAccount: state!.bankAccount,
                        invoiceType: state!.type,
                        invoiceTypeID: state!.type,
                        parkId: getLocalStorage("parkId"),
                    };
                } else if (+state!.type === InvoiceTitleTypeEnum.commonInvoice) {
                    params = {
                        bindTableName: IParkBindTableNameEnum.sysaccount,
                        title: state!.title,
                        taxId: state!.taxId,
                        invoiceType: state!.type,
                        invoiceTypeID: state!.type,
                        parkId: getLocalStorage("parkId"),
                    };
                } else if (+state!.type === InvoiceTitleTypeEnum.personInvoice) {
                    params = {
                        bindTableName: IParkBindTableNameEnum.sysaccount,
                        title: state!.title,
                        invoiceType: state!.type,
                        invoiceTypeID: state!.type,
                        parkId: getLocalStorage("parkId"),
                    };
                }
                yield put({ type: "showLoading" });

                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;
                const submitInvoiceTitle = yield call(cashInvoiceService.post, { ...params, bindTableId: currentUser.id });
                yield put({ type: "roomorder/input", data: { invoice: params, invoiceType: params.invoiceType && Number(params.invoiceType) } });
                yield put({ type: "positionorder/input", data: { invoice: params, invoiceType: params.invoiceType && Number(params.invoiceType) } });

                yield call(callback!, submitInvoiceTitle);
            } catch (e) {
                 console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *modifyInvoiceTitle({ message, id, callback }, { select, call, put }) {
            try {
                const state = yield select((state) => state[Namespaces.invoiceTitleEdit]);
                let params;

                if (+state!.type === InvoiceTitleTypeEnum.speciallyInvoice) {
                    params = {
                        bindTableName: IParkBindTableNameEnum.sysaccount,
                        title: state!.title,
                        taxId: state!.taxId,
                        registerAddress: state!.registerAddress,
                        registerTel: state!.registerTel,
                        bankName: state!.bankName,
                        bankAccount: state!.bankAccount,
                        invoiceType: state!.type,
                        invoiceTypeID: state!.type,
                        parkId: getLocalStorage("parkId"),
                    };
                } else if (+state!.type === InvoiceTitleTypeEnum.commonInvoice) {
                    params = {
                        bindTableName: IParkBindTableNameEnum.sysaccount,
                        title: state!.title,
                        taxId: state!.taxId,
                        invoiceType: state!.type,
                        invoiceTypeID: state!.type,
                        parkId: getLocalStorage("parkId"),
                    };
                } else if (+state!.type === InvoiceTitleTypeEnum.personInvoice) {
                    params = {
                        bindTableName: IParkBindTableNameEnum.sysaccount,
                        title: state!.title,
                        invoiceType: state!.type,
                        invoiceTypeID: state!.type,
                        parkId: getLocalStorage("parkId"),
                    };
                }
                yield put({ type: "showLoading" });

                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;
                const modifyInvoiceTitle = yield call(cashInvoiceService.modifyITitle, { data: { ...params, id, bindTableId: currentUser.id }, id: id });

                yield call(callback!, modifyInvoiceTitle);
            } catch (e) {
                 console.log('catcherror', e?.errmsg||e);
         message!.error(`${e?.errmsg || e}`)
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
    };
}

app.model(invoiceTitleEditModel);
