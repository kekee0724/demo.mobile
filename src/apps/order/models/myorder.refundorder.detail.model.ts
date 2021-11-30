import { EffectsMapObject } from "dva";
import { ReducersMapObject, AnyAction } from "redux";

import { freeze } from "immer";

import { CoreEffects, CoreReducers } from "@reco-m/core";

import { app } from "@reco-m/core-ui";
import { rateRateHttpService } from "@reco-m/comment-service";

import { cashPayService, cashInvoiceService } from "@reco-m/invoice-service";
import { Namespaces as authNamespaces } from "@reco-m/auth-models";

import { myOrderService } from "@reco-m/order-service";

import { IParkBindTableNameEnum, CommentAuditStatusEnum } from "@reco-m/ipark-common";

import { Namespaces } from "./common";

export namespace myorderrefundorderdetailModel {
    export const namespace = Namespaces.myorderrefundorderdetail;

    export type StateType = typeof state;

    export const state: any = freeze({}, !0);

    export const reducers: ReducersMapObject<any, AnyAction> = {
        ...CoreReducers,
    };

    export const effects: EffectsMapObject = {
        ...CoreEffects,
        *initPage({ data, message }, { put }) {
            put({ type: "showLoading" });

            try {
                yield put({ type: `getOrderDetailAction`, id: data.id, message });
                yield put({ type: `getOrderLogAction`, id: data.id, message });
                yield put({ type: `getCommentsAction`, id: data.id, message });
                yield put({ type: `getPayMessageAction`, id: data.id, message });
                yield put({ type: `getInvoiceMessageAction`, id: data.id, message });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getOrderDetailAction({ message, id }, { call, put }) {
            try {
                yield put({ type: "showLoading" });
                const result = yield call(myOrderService.get, id);
                yield put({ type: "input", data: { order: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            } finally {
                yield put({ type: "hideLoading" });
            }
        },
        *getOrderLogAction({ message, id }, { call, put }) {
            try {
                const result = yield call(myOrderService.getOrderLog, id);
                yield put({ type: "input", data: { logs: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getCommentsAction({ message, id }, { call, put, select }) {
            try {
                yield yield put({ type: `${authNamespaces.user}/getCurrentUser`, message });
                const user = yield select((state) => state[authNamespaces.user]);
                const currentUser = user!.currentUser;
                let params = {  bindTableIdList: [id], inputerId: currentUser.id, auditStatus: CommentAuditStatusEnum.pass, isShowWaitAudit: true };
                const result = yield call(rateRateHttpService.getPaged, params);
                yield put({ type: "input", data: { comments: result.items } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getPayMessageAction({ message, id }, { call, put }) {
            try {
                let params = {
                    bindTableName: IParkBindTableNameEnum.order,
                    bindTableId: id,
                };
                const result = yield call(cashPayService.getPayMessage.bind(cashPayService, params));

                yield put({ type: "input", data: { paymessage: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *getInvoiceMessageAction({ message, id }, { call, put }) {
            try {
                let params = { bindTableName: IParkBindTableNameEnum.order, bindTableId: id, pageSize: 1 };
                const result = yield call(cashInvoiceService.getPaged, params);
                if (result && result.items && result.items.length) {
                    yield put({ type: "input", data: { invoiceMessage: result.items[0] } });
                }
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *cancelRefundOrder({ message, cancelrefund }, { call, put }) {
            try {
                const result = yield call(myOrderService.cancelRefundOrder, cancelrefund.id);
                yield put({ type: "input", data: { cancelRefund: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *reRefundOrder({ message, rerefund }, { call, put }) {
            try {
                const result = yield call(myOrderService.reRefundOrder, rerefund.id);
                yield put({ type: "input", data: { reRefund: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
        *cancelOrder({ message, cancel }, { call, put }) {
            try {
                const result = yield call(myOrderService.cancelOrder, cancel.id);
                yield put({ type: "input", data: { orderOperate: result } });
            } catch (e) {
                console.log('catcherror', e?.errmsg||e);
                message!.error(`${e?.errmsg || e}`);
            }
        },
    };
}

app.model(myorderrefundorderdetailModel);
